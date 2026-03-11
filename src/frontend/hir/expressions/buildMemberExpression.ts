import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { isStaticMemberAccess } from "../../../babel-utils";
import { Environment } from "../../../environment";
import {
  BinaryExpressionInstruction,
  BindingIdentifierInstruction,
  ExpressionStatementInstruction,
  LiteralInstruction,
  LoadDynamicPropertyInstruction,
  LoadLocalInstruction,
  LoadStaticPropertyInstruction,
  Place,
  StoreLocalInstruction,
} from "../../../ir";
import { StoreDynamicPropertyInstruction } from "../../../ir/instructions/memory/StoreDynamicProperty";
import { StoreStaticPropertyInstruction } from "../../../ir/instructions/memory/StoreStaticProperty";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildMemberExpression(
  nodePath: NodePath<t.MemberExpression | t.OptionalMemberExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const optional =
    nodePath.isOptionalMemberExpression() && nodePath.node.optional;
  const objectPath = nodePath.get("object");
  const objectPlace = buildNode(
    objectPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (objectPlace === undefined || Array.isArray(objectPlace)) {
    throw new Error("Member expression object must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);

  const propertyPath: NodePath<t.MemberExpression["property"]> =
    nodePath.get("property");
  propertyPath.assertExpression();
  if (isStaticMemberAccess(nodePath)) {
    const propertyName = getStaticPropertyName(propertyPath);
    const instruction = environment.createInstruction(
      LoadStaticPropertyInstruction,
      place,
      nodePath,
      objectPlace,
      propertyName,
      optional,
    );
    functionBuilder.addInstruction(instruction);
    return place;
  } else {
    const propertyPlace = buildNode(
      propertyPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
      throw new Error("Member expression property must be a single place");
    }
    const instruction = environment.createInstruction(
      LoadDynamicPropertyInstruction,
      place,
      nodePath,
      objectPlace,
      propertyPlace,
      optional,
    );
    functionBuilder.addInstruction(instruction);
    return place;
  }
}

/**
 * Handles UpdateExpression where the argument is a MemberExpression.
 * e.g. `++obj.prop`, `obj.prop--`, `++arr[i]`, `arr[i]--`
 *
 * Desugars to:
 *   1. Load the current property value
 *   2. Compute value +/- 1
 *   3. Store the new value back to the property
 *   4. Return old value (postfix) or new value (prefix)
 */
export function buildMemberExpressionUpdate(
  updatePath: NodePath<t.UpdateExpression>,
  memberPath: NodePath<t.MemberExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  // 1. Build the object expression
  const objectPath = memberPath.get("object");
  const objectPlace = buildNode(
    objectPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (objectPlace === undefined || Array.isArray(objectPlace)) {
    throw new Error("Update expression object must be a single place");
  }

  // 2. Load the current property value
  const loadIdentifier = environment.createIdentifier();
  const loadPlace = environment.createPlace(loadIdentifier);

  const propertyPath: NodePath<t.MemberExpression["property"]> =
    memberPath.get("property");
  propertyPath.assertExpression();

  const isStatic = isStaticMemberAccess(memberPath);
  let dynamicPropertyPlace: Place | undefined;

  if (isStatic) {
    const propertyName = getStaticPropertyName(propertyPath);
    const loadInstruction = environment.createInstruction(
      LoadStaticPropertyInstruction,
      loadPlace,
      memberPath,
      objectPlace,
      propertyName,
    );
    functionBuilder.addInstruction(loadInstruction);
  } else {
    dynamicPropertyPlace = buildNode(
      propertyPath,
      functionBuilder,
      moduleBuilder,
      environment,
    ) as Place;
    if (
      dynamicPropertyPlace === undefined ||
      Array.isArray(dynamicPropertyPlace)
    ) {
      throw new Error("Update expression property must be a single place");
    }
    const loadInstruction = environment.createInstruction(
      LoadDynamicPropertyInstruction,
      loadPlace,
      memberPath,
      objectPlace,
      dynamicPropertyPlace,
    );
    functionBuilder.addInstruction(loadInstruction);
  }

  // 3. Materialize old value into a temporary so codegen doesn't
  //    re-read the property after it has been mutated by the store.
  const oldValBinding = environment.createIdentifier();
  const oldValBindingPlace = environment.createPlace(oldValBinding);
  functionBuilder.addInstruction(
    environment.createInstruction(
      BindingIdentifierInstruction,
      oldValBindingPlace,
      updatePath,
      oldValBinding.name,
    ),
  );
  const oldValStorePlace = environment.createPlace(
    environment.createIdentifier(),
  );
  functionBuilder.addInstruction(
    environment.createInstruction(
      StoreLocalInstruction,
      oldValStorePlace,
      updatePath,
      oldValBindingPlace,
      loadPlace,
      "const",
    ),
  );
  const oldValLoadPlace = environment.createPlace(
    environment.createIdentifier(),
  );
  functionBuilder.addInstruction(
    environment.createInstruction(
      LoadLocalInstruction,
      oldValLoadPlace,
      updatePath,
      oldValBindingPlace,
    ),
  );

  // 4. Create literal 1
  const oneIdentifier = environment.createIdentifier();
  const onePlace = environment.createPlace(oneIdentifier);
  const oneInstruction = environment.createInstruction(
    LiteralInstruction,
    onePlace,
    updatePath,
    1,
  );
  functionBuilder.addInstruction(oneInstruction);

  // 5. Compute value +/- 1
  const isIncrement = updatePath.node.operator === "++";
  const resultIdentifier = environment.createIdentifier();
  const resultPlace = environment.createPlace(resultIdentifier);
  const binaryInstruction = environment.createInstruction(
    BinaryExpressionInstruction,
    resultPlace,
    updatePath,
    isIncrement ? "+" : "-",
    oldValLoadPlace,
    onePlace,
  );
  functionBuilder.addInstruction(binaryInstruction);

  // 6. Store the new value back to the property
  const storeIdentifier = environment.createIdentifier();
  const storePlace = environment.createPlace(storeIdentifier);

  if (isStatic) {
    const propertyName = getStaticPropertyName(propertyPath);
    const storeInstruction = environment.createInstruction(
      StoreStaticPropertyInstruction,
      storePlace,
      updatePath,
      objectPlace,
      propertyName,
      resultPlace,
    );
    functionBuilder.addInstruction(storeInstruction);
  } else {
    const storeInstruction = environment.createInstruction(
      StoreDynamicPropertyInstruction,
      storePlace,
      updatePath,
      objectPlace,
      dynamicPropertyPlace!,
      resultPlace,
    );
    functionBuilder.addInstruction(storeInstruction);
  }

  // 7. Wrap the store in an ExpressionStatement so codegen emits it
  const exprStmtIdentifier = environment.createIdentifier();
  const exprStmtPlace = environment.createPlace(exprStmtIdentifier);
  const exprStmtInstruction = environment.createInstruction(
    ExpressionStatementInstruction,
    exprStmtPlace,
    updatePath,
    storePlace,
  );
  functionBuilder.addInstruction(exprStmtInstruction);

  // 8. Return old value (postfix) or new value (prefix)
  return updatePath.node.prefix ? resultPlace : oldValLoadPlace;
}

function getStaticPropertyName(nodePath: NodePath<t.Expression>) {
  if (nodePath.isIdentifier()) {
    return nodePath.node.name;
  } else if (nodePath.isStringLiteral()) {
    return nodePath.node.value;
  } else if (nodePath.isNumericLiteral()) {
    return String(nodePath.node.value);
  }

  throw new Error("Unsupported static property type");
}
