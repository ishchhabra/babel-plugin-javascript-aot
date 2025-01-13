import * as t from "@babel/types";
import { ExpressionStatementInstruction } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";

export function generateExpressionStatementInstruction(
  instruction: ExpressionStatementInstruction,
  generator: CodeGenerator,
): t.Statement | undefined {
  const expression = generator.places.get(instruction.expression.id);
  if (expression === undefined) {
    throw new Error(`Place ${instruction.expression.id} not found`);
  }
  t.assertExpression(expression);

  const node = t.expressionStatement(expression);
  generator.places.set(instruction.place.id, node);
  return node;
}
