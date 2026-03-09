import * as t from "@babel/types";
import { JSXOpeningElementInstruction } from "../../../../ir/instructions/jsx/JSXOpeningElement";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateJSXOpeningElementInstruction(
  instruction: JSXOpeningElementInstruction,
  generator: CodeGenerator,
): t.JSXOpeningElement {
  let tagName: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName;
  if (instruction.tagPlace) {
    // For component tags, use the resolved identifier name
    const resolved = generator.places.get(instruction.tagPlace.id);
    if (resolved && t.isIdentifier(resolved)) {
      tagName = parseJSXTagName(resolved.name);
    } else {
      tagName = parseJSXTagName(instruction.tag);
    }
  } else {
    tagName = parseJSXTagName(instruction.tag);
  }

  const attributes = instruction.attributes.map((attrPlace) => {
    const attrNode = generator.places.get(attrPlace.id);
    if (!attrNode) {
      throw new Error(`Place not found for JSX attribute: ${attrPlace.id}`);
    }
    if (t.isJSXAttribute(attrNode)) {
      return attrNode;
    }
    if (t.isJSXSpreadAttribute(attrNode)) {
      return attrNode;
    }
    // Wrap expression in JSXSpreadAttribute as fallback
    t.assertExpression(attrNode);
    return t.jsxSpreadAttribute(attrNode);
  });

  const node = t.jsxOpeningElement(
    tagName,
    attributes,
    instruction.selfClosing,
  );
  generator.places.set(instruction.place.id, node);
  return node;
}

function parseJSXTagName(
  tag: string,
): t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName {
  // Handle namespaced names (e.g., "svg:rect")
  if (tag.includes(":")) {
    const [ns, name] = tag.split(":");
    return t.jsxNamespacedName(t.jsxIdentifier(ns), t.jsxIdentifier(name));
  }

  // Handle member expressions (e.g., "Foo.Bar.Baz")
  if (tag.includes(".")) {
    const parts = tag.split(".");
    let result: t.JSXIdentifier | t.JSXMemberExpression = t.jsxIdentifier(
      parts[0],
    );
    for (let i = 1; i < parts.length; i++) {
      result = t.jsxMemberExpression(result, t.jsxIdentifier(parts[i]));
    }
    return result;
  }

  return t.jsxIdentifier(tag);
}
