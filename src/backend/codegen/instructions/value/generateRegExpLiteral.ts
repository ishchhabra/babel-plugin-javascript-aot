import * as t from "@babel/types";
import { RegExpLiteralInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateRegExpLiteralInstruction(
  instruction: RegExpLiteralInstruction,
  generator: CodeGenerator,
): t.Expression {
  const node = t.regExpLiteral(instruction.pattern, instruction.flags);
  generator.places.set(instruction.place.id, node);
  return node;
}
