import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  ExpressionStatementInstruction,
  makeInstructionId,
  Place,
  StoreLocalInstruction,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildExpressionStatement(
  nodePath: NodePath<t.ExpressionStatement>,
  builder: HIRBuilder,
): Place | undefined {
  const expressionPath = nodePath.get("expression");
  const expressionPlace = buildNode(expressionPath, builder);
  if (expressionPlace === undefined || Array.isArray(expressionPlace)) {
    throw new Error("Expression statement expression must be a single place");
  }

  // For assignments, since we convert them to a memory instruction,
  // we do not need to emit an expression statement instruction.
  const expressionInstruction = builder.currentBlock.instructions.at(-1);
  if (
    expressionInstruction instanceof StoreLocalInstruction &&
    expressionInstruction.place === expressionPlace
  ) {
    return;
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );
  builder.currentBlock.instructions.push(
    new ExpressionStatementInstruction(
      instructionId,
      place,
      expressionPath,
      expressionPlace,
    ),
  );

  return place;
}
