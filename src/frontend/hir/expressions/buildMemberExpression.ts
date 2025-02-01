import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { isStaticMemberAccess } from "../../../babel-utils";
import { Environment } from "../../../environment";
import {
  LoadDynamicPropertyInstruction,
  LoadStaticPropertyInstruction,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildMemberExpression(
  nodePath: NodePath<t.MemberExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
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
    );
    functionBuilder.addInstruction(instruction);
    return place;
  }
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
