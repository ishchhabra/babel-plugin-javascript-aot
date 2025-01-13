import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  LogicalExpressionInstruction,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildLogicalExpression(
  nodePath: NodePath<t.LogicalExpression>,
  builder: HIRBuilder,
) {
  const leftPath = nodePath.get("left");
  const leftPlace = buildNode(leftPath, builder);
  if (leftPlace === undefined || Array.isArray(leftPlace)) {
    throw new Error("Logical expression left must be a single place");
  }

  const rightPath = nodePath.get("right");
  const rightPlace = buildNode(rightPath, builder);
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Logical expression right must be a single place");
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new LogicalExpressionInstruction(
      instructionId,
      place,
      nodePath,
      nodePath.node.operator,
      leftPlace,
      rightPlace,
    ),
  );

  return place;
}
