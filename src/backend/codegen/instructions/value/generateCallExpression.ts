import * as t from "@babel/types";
import { CallExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateCallExpression(
  instruction: CallExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  const callee = generator.places.get(instruction.callee.id);
  if (callee === undefined) {
    throw new Error(`Place ${instruction.callee.id} not found`);
  }

  t.assertExpression(callee);

  const args = instruction.args.map((argument) => {
    const node = generator.places.get(argument.id);
    if (node === undefined) {
      throw new Error(`Place ${argument.id} not found`);
    }

    t.assertExpression(node);
    return node;
  });

  const inOptionalChain =
    instruction.optional ||
    t.isOptionalMemberExpression(callee) ||
    t.isOptionalCallExpression(callee);
  const node = inOptionalChain
    ? t.optionalCallExpression(callee, args, instruction.optional)
    : t.callExpression(callee, args);
  generator.places.set(instruction.place.id, node);
  return node;
}
