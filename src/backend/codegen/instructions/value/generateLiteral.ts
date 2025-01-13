import * as t from "@babel/types";
import { LiteralInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateLiteralInstruction(
  instruction: LiteralInstruction,
  generator: CodeGenerator,
): t.Expression {
  const node = t.valueToNode(instruction.value);
  generator.places.set(instruction.place.id, node);
  return node;
}
