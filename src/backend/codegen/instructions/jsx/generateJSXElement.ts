import * as t from "@babel/types";
import { assertJSXChild } from "../../../../babel-utils";
import { JSXElementInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateJSXElementInstruction(
  instruction: JSXElementInstruction,
  generator: CodeGenerator,
) {
  const openingElement = generator.places.get(instruction.openingElement.id);
  t.assertJSXOpeningElement(openingElement);

  let closingElement = null;
  if (instruction.closingElement !== undefined) {
    closingElement = generator.places.get(instruction.closingElement.id);
    t.assertJSXClosingElement(closingElement);
  }

  const children = instruction.children.map((child) => {
    const node = generator.places.get(child.id);
    assertJSXChild(node);
    return node;
  });

  const selfClosing = closingElement === null;
  const node = t.jsxElement(
    openingElement,
    closingElement,
    children,
    selfClosing,
  );
  generator.places.set(instruction.place.id, node);
  return node;
}
