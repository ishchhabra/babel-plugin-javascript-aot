import * as t from "@babel/types";
import { LoadGlobalInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateLoadGlobalInstruction(
  instruction: LoadGlobalInstruction,
  generator: CodeGenerator,
): t.Expression {
  const node = t.identifier(instruction.name);
  generator.places.set(instruction.place.id, node);
  return node;
}
