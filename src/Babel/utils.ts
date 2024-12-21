import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

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

export function getExpressionName(
  expression: NodePath<t.Expression>,
): string | null {
  if (expression.isIdentifier()) {
    return expression.node.name;
  }

  return null;
}
