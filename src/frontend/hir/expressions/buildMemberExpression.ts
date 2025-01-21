import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  MemberExpressionInstruction,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildMemberExpression(
  nodePath: NodePath<t.MemberExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const objectPath = nodePath.get("object");
  const objectPlace = buildNode(objectPath, functionBuilder, moduleBuilder);
  if (objectPlace === undefined || Array.isArray(objectPlace)) {
    throw new Error("Member expression object must be a single place");
  }

  const propertyPath = nodePath.get("property");
  const propertyPlace = buildNode(propertyPath, functionBuilder, moduleBuilder);
  if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
    throw new Error("Member expression property must be a single place");
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = createInstructionId(functionBuilder.environment);

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
