import * as t from "@babel/types";
import { TemplateLiteralInstruction } from "../../../../ir/instructions/value/TemplateLiteral";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateTemplateLiteralInstruction(
  instruction: TemplateLiteralInstruction,
  generator: CodeGenerator,
): t.Expression {
  const expressions = instruction.expressions.map((expr) => {
    const node = generator.places.get(expr.id);
    if (!node) {
      throw new Error(
        `Place not found for template literal expression: ${expr.id}`,
      );
    }
    t.assertExpression(node);
    return node;
  });

  const node = t.templateLiteral(instruction.quasis, expressions);
  generator.places.set(instruction.place.id, node);
  return node;
}
