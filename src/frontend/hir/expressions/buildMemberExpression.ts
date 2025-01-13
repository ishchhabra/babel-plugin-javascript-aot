import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  MemberExpressionInstruction,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildMemberExpression(
  nodePath: NodePath<t.MemberExpression>,
  builder: HIRBuilder,
) {
  const objectPath = nodePath.get("object");
  const objectPlace = buildNode(objectPath, builder);
  if (objectPlace === undefined || Array.isArray(objectPlace)) {
    throw new Error("Member expression object must be a single place");
  }

  const propertyPath = nodePath.get("property");
  const propertyPlace = buildNode(propertyPath, builder);
  if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
    throw new Error("Member expression property must be a single place");
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
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
