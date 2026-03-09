import * as t from "@babel/types";
import { JSXAttributeInstruction } from "../../../../ir/instructions/jsx/JSXAttribute";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateJSXAttributeInstruction(
  instruction: JSXAttributeInstruction,
  generator: CodeGenerator,
): t.JSXAttribute {
  const name = parseJSXAttributeName(instruction.name);

  let value: t.JSXAttribute["value"] = null;
  if (instruction.value !== undefined) {
    const valueNode = generator.places.get(instruction.value.id);
    if (!valueNode) {
      throw new Error(
        `Place not found for JSX attribute value: ${instruction.value.id}`,
      );
    }
    if (t.isStringLiteral(valueNode)) {
      value = valueNode;
    } else if (t.isJSXElement(valueNode)) {
      value = valueNode;
    } else if (t.isJSXFragment(valueNode)) {
      value = valueNode;
    } else if (t.isJSXExpressionContainer(valueNode)) {
      value = valueNode;
    } else {
      // Wrap expression in JSXExpressionContainer
      t.assertExpression(valueNode);
      value = t.jsxExpressionContainer(valueNode);
    }
  }

  const node = t.jsxAttribute(name, value);
  generator.places.set(instruction.place.id, node);
  return node;
}

function parseJSXAttributeName(
  name: string,
): t.JSXIdentifier | t.JSXNamespacedName {
  if (name.includes(":")) {
    const [ns, local] = name.split(":");
    return t.jsxNamespacedName(t.jsxIdentifier(ns), t.jsxIdentifier(local));
  }
  return t.jsxIdentifier(name);
}
