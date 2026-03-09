import * as t from "@babel/types";
import { SequenceExpressionInstruction } from "../../../../ir/instructions/value/SequenceExpression";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateSequenceExpressionInstruction(
  instruction: SequenceExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  const expressions = instruction.expressions.map((expr) => {
    const node = generator.places.get(expr.id);
    if (!node) {
      throw new Error(
        `Place not found for sequence expression element: ${expr.id}`,
      );
    }
    t.assertExpression(node);
    return node;
  });

  const node = t.sequenceExpression(expressions);
  generator.places.set(instruction.place.id, node);
  return node;
}
