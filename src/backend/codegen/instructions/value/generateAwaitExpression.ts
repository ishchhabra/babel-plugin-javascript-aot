import * as t from "@babel/types";
import { AwaitExpressionInstruction } from "../../../../ir/instructions/value/AwaitExpression";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateAwaitExpressionInstruction(
  instruction: AwaitExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  const argument = generator.places.get(instruction.argument.id);
  if (!argument) {
    throw new Error(
      `Place not found for await argument: ${instruction.argument.id}`,
    );
  }
  t.assertExpression(argument);

  const node = t.awaitExpression(argument);
  generator.places.set(instruction.place.id, node);
  return node;
}
