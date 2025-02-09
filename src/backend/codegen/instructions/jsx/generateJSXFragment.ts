import * as t from "@babel/types";
import { assertJSXChild } from "../../../../babel-utils";
import { JSXFragmentInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateJSXFragmentInstruction(
  instruction: JSXFragmentInstruction,
  generator: CodeGenerator,
) {
  const openingFragment = generator.places.get(instruction.openingFragment.id);
  t.assertJSXOpeningFragment(openingFragment);

  const closingFragment = generator.places.get(instruction.closingFragment.id);
  t.assertJSXClosingFragment(closingFragment);

  const children = instruction.children.map((child) => {
    const node = generator.places.get(child.id);
    assertJSXChild(node);
    return node;
  });

  const node = t.jsxFragment(openingFragment, closingFragment, children);
  generator.places.set(instruction.place.id, node);
  return node;
}
