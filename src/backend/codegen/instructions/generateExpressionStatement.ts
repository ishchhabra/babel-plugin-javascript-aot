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
  // StoreLocal codegen produces VariableDeclaration (a Statement), which can
  // end up here when a for-loop init expression is built via
  // buildExpressionAsStatement. Return it directly instead of wrapping.
  if (t.isStatement(expression)) {
    generator.places.set(instruction.place.id, expression);
    return expression as t.Statement;
  }

  t.assertExpression(expression);

  const node = t.expressionStatement(expression);
  generator.places.set(instruction.place.id, node);
  return node;
}
