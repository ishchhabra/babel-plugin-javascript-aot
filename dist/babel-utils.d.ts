import { NodePath } from "@babel/core";
import * as t from "@babel/types";
/**
 * Returns the name of the function declaration or arrow function expression.
 *
 * @param path - The path to the function declaration or arrow function expression.
 * @returns The name of the function declaration or arrow function expression.
 */
export declare function getFunctionName(path: NodePath<t.FunctionDeclaration | t.ArrowFunctionExpression>): NodePath<t.Identifier> | null;
