import { NodePath } from "@babel/core";
import * as t from "@babel/types";
/**
 * Returns the name of the function declaration or arrow function expression.
 *
 * @param path - The path to the function declaration or arrow function expression.
 * @returns The name of the function declaration or arrow function expression.
 */
export declare function getFunctionName(path: NodePath<t.FunctionDeclaration | t.ArrowFunctionExpression>): NodePath<t.Identifier> | null;
export declare function getMethodName(path: NodePath<t.ObjectMethod | t.ArrowFunctionExpression>): NodePath<t.Identifier> | null;
export declare function assertJSXChild(node: t.Node | null): asserts node is t.JSXText | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXElement | t.JSXFragment;
export declare function toIdentifierOrStringLiteral(name: string): t.Identifier | t.StringLiteral;
/**
 * Determines whether a MemberExpression should be considered "static"
 * or "dynamic" in the intermediate representation (IR).
 *
 * A MemberExpression is treated as "static" if it is not computed
 * (i.e., accessed via dot notation) or if it is accessed via bracket
 * notation with a known literal property (e.g., `obj["foo"]` or
 * `obj[0]`). In contrast, any bracket access (e.g., `obj[anything]`)
 * sets `node.computed = true` in Babel, indicating dynamic access.
 *
 * @param path - The NodePath of the MemberExpression to evaluate.
 * @returns `true` if the MemberExpression is static, `false` if it is dynamic.
 */
export declare function isStaticMemberAccess(path: NodePath<t.MemberExpression>): boolean;
