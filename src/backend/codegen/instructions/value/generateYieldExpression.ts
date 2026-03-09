import * as t from "@babel/types";
import { YieldExpressionInstruction } from "../../../../ir/instructions/value/YieldExpression";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateYieldExpressionInstruction(
  instruction: YieldExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  let argument: t.Expression | undefined;
  if (instruction.argument) {
    const argNode = generator.places.get(instruction.argument.id);
    if (!argNode) {
      throw new Error(
        `Place not found for yield argument: ${instruction.argument.id}`,
      );
    }
    t.assertExpression(argNode);
    argument = argNode;
  }

  const node = t.yieldExpression(argument, instruction.delegate);
  generator.places.set(instruction.place.id, node);
  return node;
}
