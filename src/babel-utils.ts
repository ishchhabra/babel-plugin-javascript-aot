import { NodePath } from "@babel/core";
import * as t from "@babel/types";

/**
 * Returns the name of the function declaration or arrow function expression.
 *
 * @param path - The path to the function declaration or arrow function expression.
 * @returns The name of the function declaration or arrow function expression.
 */
export function getFunctionName(
  path: NodePath<t.FunctionDeclaration | t.ArrowFunctionExpression>
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