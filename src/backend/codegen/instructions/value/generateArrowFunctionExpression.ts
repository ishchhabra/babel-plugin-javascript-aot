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
    const expressionInstr =
      instruction.functionIR.entryBlock.instructions.at(-1)!;
    const expression = generator.places.get(expressionInstr.place.id);
    t.assertExpression(expression);
    body = expression;
  }

  const node = t.arrowFunctionExpression(params, body, instruction.async);
  generator.places.set(instruction.place.id, node);
  return node;
}
