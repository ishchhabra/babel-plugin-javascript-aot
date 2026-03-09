import * as t from "@babel/types";
import { NewExpressionInstruction } from "../../../../ir/instructions/value/NewExpression";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateNewExpressionInstruction(
  instruction: NewExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  const callee = generator.places.get(instruction.callee.id);
  if (!callee) {
    throw new Error(
      `Place not found for new expression callee: ${instruction.callee.id}`,
    );
  }
  t.assertExpression(callee);

  const args = instruction.args.map((argument) => {
    const node = generator.places.get(argument.id);
    if (!node) {
      throw new Error(
        `Place not found for new expression argument: ${argument.id}`,
      );
    }
    t.assertExpression(node);
    return node;
  });

  const node = t.newExpression(callee, args);
  generator.places.set(instruction.place.id, node);
  return node;
}
