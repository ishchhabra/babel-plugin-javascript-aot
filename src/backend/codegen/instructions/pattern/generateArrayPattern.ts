import * as t from "@babel/types";
import { ArrayPatternInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateArrayPatternInstruction(
  instruction: ArrayPatternInstruction,
  generator: CodeGenerator,
): t.ArrayPattern {
  const elements = instruction.elements.map((element) => {
    const node = generator.places.get(element.id);
    if (node === undefined) {
      throw new Error(`Place ${element.id} not found`);
    }

    if (node === null) {
      return null;
    }

    t.assertLVal(node);
    return node;
  });

  const node = t.arrayPattern(elements);
  generator.places.set(instruction.place.id, node);
  return node;
}
