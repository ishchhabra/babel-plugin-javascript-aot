import * as t from "@babel/types";
import { LoadLocalInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateLoadLocalInstruction(
  instruction: LoadLocalInstruction,
  generator: CodeGenerator,
): t.Expression {
  const node = t.identifier(instruction.value.identifier.name);
  generator.places.set(instruction.place.id, node);
  return node;
}
