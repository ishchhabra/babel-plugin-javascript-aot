import * as t from "@babel/types";
import { ThisExpressionInstruction } from "../../../../ir/instructions/value/ThisExpression";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateThisExpressionInstruction(
  instruction: ThisExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  const node = t.thisExpression();
  generator.places.set(instruction.place.id, node);
  return node;
}
