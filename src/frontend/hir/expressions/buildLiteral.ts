import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  LiteralInstruction,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";

export function buildLiteral(
  expressionPath: NodePath<t.Literal>,
  builder: HIRBuilder,
) {
  if (
    !t.isNumericLiteral(expressionPath.node) &&
    !t.isStringLiteral(expressionPath.node) &&
    !t.isBooleanLiteral(expressionPath.node)
  ) {
    throw new Error(`Unsupported literal type: ${expressionPath.type}`);
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new LiteralInstruction(
      instructionId,
      place,
      expressionPath,
      expressionPath.node.value,
    ),
  );

  return place;
}
