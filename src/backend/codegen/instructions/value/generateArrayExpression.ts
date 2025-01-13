import * as t from "@babel/types";
import { ArrayExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateArrayExpressionInstruction(
  instruction: ArrayExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  const elements = instruction.elements.map((element) => {
    const node = generator.places.get(element.id);
    if (node === undefined) {
      throw new Error(`Place ${element.id} not found`);
    }

    if (node === null || t.isSpreadElement(node)) {
      return node;
    }

    t.assertExpression(node);
    return node;
  });

  const node = t.arrayExpression(elements);
  generator.places.set(instruction.place.id, node);
  return node;
}
