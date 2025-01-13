import * as t from "@babel/types";
import { BindingIdentifierInstruction } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";

export function generateBindingIdentifierInstruction(
  instruction: BindingIdentifierInstruction,
  generator: CodeGenerator,
): t.Identifier {
  const node = t.identifier(instruction.name);
  generator.places.set(instruction.place.id, node);
  return node;
}
