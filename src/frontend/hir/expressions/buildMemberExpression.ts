import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { createInstructionId, MemberExpressionInstruction } from "../../../ir";
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

  const propertyPath = nodePath.get("property");
  const propertyPlace = buildNode(
    propertyPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
    throw new Error("Member expression property must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instructionId = createInstructionId(environment);

  functionBuilder.addInstruction(
    new MemberExpressionInstruction(
      instructionId,
      place,
      nodePath,
      objectPlace,
      propertyPlace,
      nodePath.node.computed,
    ),
  );

  return place;
}
