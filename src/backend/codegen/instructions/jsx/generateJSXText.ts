import * as t from "@babel/types";
import { JSXTextInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateJSXTextInstruction(
  instruction: JSXTextInstruction,
  generator: CodeGenerator,
) {
  const node = t.jsxText(instruction.value);
  generator.places.set(instruction.place.id, node);
  return node;
}
