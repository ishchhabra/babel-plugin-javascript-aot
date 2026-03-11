import * as t from "@babel/types";
import { ArrowFunctionExpressionInstruction } from "../../../../ir/instructions/value/ArrowFunctionExpression";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateFunction } from "../../generateFunction";

export function generateArrowFunctionExpressionInstruction(
  instruction: ArrowFunctionExpressionInstruction,
  generator: CodeGenerator,
): t.ArrowFunctionExpression {
  const { params, statements } = generateFunction(
    instruction.functionIR,
    generator,
  );

  let body: t.BlockStatement | t.Expression = t.blockStatement(statements);
  if (instruction.expression) {
    // For expression-bodied arrows, try to recover a single expression.
    // After SSA, a simple `(a) => expr` may produce multiple blocks
    // (e.g. from ternary/logical expressions). The frontend adds a
    // ReturnTerminal, so the last statement should be a ReturnStatement.
    const expr = extractExpressionBody(statements);
    if (expr) {
      body = expr;
    }
    // If we can't extract a single expression, keep the block body
    // (which already has the correct return statement from the terminal).
  }

  const node = t.arrowFunctionExpression(params, body, instruction.async);
  generator.places.set(instruction.place.id, node);
  return node;
}

/**
 * Try to extract a single expression from the generated statements
 * that can be used as an arrow function expression body.
 */
function extractExpressionBody(
  statements: t.Statement[],
): t.Expression | undefined {
  if (statements.length !== 1) return undefined;

  const stmt = statements[0];
  if (t.isReturnStatement(stmt) && stmt.argument) {
    return stmt.argument;
  }
  if (t.isExpressionStatement(stmt)) {
    return stmt.expression;
  }

  return undefined;
}
