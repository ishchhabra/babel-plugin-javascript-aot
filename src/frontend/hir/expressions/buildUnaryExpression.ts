import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  UnaryExpressionInstruction,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildUnaryExpression(
  nodePath: NodePath<t.UnaryExpression>,
  builder: HIRBuilder,
) {
  const argumentPath = nodePath.get("argument");
  const argumentPlace = buildNode(argumentPath, builder);
  if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
    throw new Error("Unary expression argument must be a single place");
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new UnaryExpressionInstruction(
      instructionId,
      place,
      nodePath,
      nodePath.node.operator,
      argumentPlace,
    ),
  );

  return place;
}
