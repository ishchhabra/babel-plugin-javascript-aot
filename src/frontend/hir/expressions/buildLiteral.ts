import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  LiteralInstruction,
  makeInstructionId,
} from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildLiteral(
  expressionPath: NodePath<t.Literal>,
  functionBuilder: FunctionIRBuilder,
) {
  if (
    !t.isNumericLiteral(expressionPath.node) &&
    !t.isStringLiteral(expressionPath.node) &&
    !t.isBooleanLiteral(expressionPath.node)
  ) {
    throw new Error(`Unsupported literal type: ${expressionPath.type}`);
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  functionBuilder.currentBlock.instructions.push(
    new LiteralInstruction(
      instructionId,
      place,
      expressionPath,
      expressionPath.node.value,
    ),
  );

  return place;
}
