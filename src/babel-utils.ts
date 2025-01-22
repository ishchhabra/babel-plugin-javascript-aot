import { NodePath } from "@babel/core";
import { isKeyword } from "@babel/helper-validator-identifier";
import * as t from "@babel/types";

/**
 * Returns the name of the function declaration or arrow function expression.
 *
 * @param path - The path to the function declaration or arrow function expression.
 * @returns The name of the function declaration or arrow function expression.
 */
export function getFunctionName(
  path: NodePath<t.FunctionDeclaration | t.ArrowFunctionExpression>,
): NodePath<t.Identifier> | null {
  if (path.isFunctionDeclaration()) {
    const id = path.get("id");
    if (id.isIdentifier()) {
      return id;
    }

    return null;
  }

  return null;
}

export function getMethodName(
  path: NodePath<t.ObjectMethod | t.ArrowFunctionExpression>,
): NodePath<t.Identifier> | null {
  if (path.isObjectMethod()) {
    const id = path.get("key");
    if (id.isIdentifier()) {
      return id;
    }
  }

  return null;
}

export function assertJSXChild(
  node: t.Node | null,
): asserts node is
  | t.JSXText
  | t.JSXExpressionContainer
  | t.JSXSpreadChild
  | t.JSXElement
  | t.JSXFragment {}

export function toIdentifierOrStringLiteral(
  name: string,
): t.Identifier | t.StringLiteral {
  return t.isValidIdentifier(name) || isKeyword(name)
    ? t.identifier(name)
    : t.stringLiteral(name);
}
