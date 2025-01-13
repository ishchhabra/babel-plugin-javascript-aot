import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  BinaryExpressionInstruction,
  createIdentifier,
  createPlace,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildBinaryExpression(
  nodePath: NodePath<t.BinaryExpression>,
  builder: HIRBuilder,
) {
  const leftPath: NodePath<t.PrivateName | t.Expression> = nodePath.get("left");
  leftPath.assertExpression();
  const leftPlace = buildNode(leftPath, builder);
  if (leftPlace === undefined || Array.isArray(leftPlace)) {
    throw new Error("Binary expression left must be a single place");
  }

  const rightPath = nodePath.get("right");
  const rightPlace = buildNode(rightPath, builder);
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Binary expression right must be a single place");
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new BinaryExpressionInstruction(
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
