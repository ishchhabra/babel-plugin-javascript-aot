import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  ExpressionStatementInstruction,
  Place,
  StoreLocalInstruction,
} from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildNode } from "../buildNode";

export function buildExpressionStatement(
  nodePath: NodePath<t.ExpressionStatement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place | undefined {
  const expressionPath = nodePath.get("expression");
  const expressionPlace = buildNode(
    expressionPath,
    functionBuilder,
    moduleBuilder,
  );
  if (expressionPlace === undefined || Array.isArray(expressionPlace)) {
    throw new Error("Expression statement expression must be a single place");
  }

  // For assignments, since we convert them to a memory instruction,
  // we do not need to emit an expression statement instruction.
  const expressionInstruction =
    functionBuilder.currentBlock.instructions.at(-1);
  if (
    expressionInstruction instanceof StoreLocalInstruction &&
    expressionInstruction.place === expressionPlace
  ) {
    return;
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = createInstructionId(functionBuilder.environment);
  functionBuilder.currentBlock.instructions.push(
    new ExpressionStatementInstruction(
      instructionId,
      place,
      expressionPath,
      expressionPlace,
    ),
  );

  return place;
}
