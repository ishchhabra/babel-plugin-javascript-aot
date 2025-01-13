import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildUnsupportedNode } from "../buildUnsupportedNode";
import { buildBlockStatement } from "./buildBlockStatement";
import { buildExportDefaultDeclaration } from "./buildExportDefaultDeclaration";
import { buildExportNamedDeclaration } from "./buildExportNamedDeclaration";
import { buildExpressionStatement } from "./buildExpressionStatement";
import { buildForStatement } from "./buildForStatement";
import { buildFunctionDeclaration } from "./buildFunctionDeclaration";
import { buildIfStatement } from "./buildIfStatement";
import { buildImportDeclaration } from "./buildImportDeclaration";
import { buildReturnStatement } from "./buildReturnStatement";
import { buildVariableDeclaration } from "./buildVariableDeclaration";
import { buildWhileStatement } from "./buildWhileStatement";

export function buildStatement(
  nodePath: NodePath<t.Statement>,
  builder: HIRBuilder,
): Place | Place[] | undefined {
  switch (nodePath.type) {
    case "BlockStatement":
      nodePath.assertBlockStatement();
      return buildBlockStatement(nodePath, builder);
    case "ExportDefaultDeclaration":
      nodePath.assertExportDefaultDeclaration();
      return buildExportDefaultDeclaration(nodePath, builder);
    case "ExportNamedDeclaration":
      nodePath.assertExportNamedDeclaration();
      return buildExportNamedDeclaration(nodePath, builder);
    case "ForStatement":
      nodePath.assertForStatement();
      return buildForStatement(nodePath, builder);
    case "IfStatement":
      nodePath.assertIfStatement();
      return buildIfStatement(nodePath, builder);
    case "ImportDeclaration":
      nodePath.assertImportDeclaration();
      return buildImportDeclaration(nodePath, builder);
    case "ExpressionStatement":
      nodePath.assertExpressionStatement();
      return buildExpressionStatement(nodePath, builder);
    case "FunctionDeclaration":
      nodePath.assertFunctionDeclaration();
      return buildFunctionDeclaration(nodePath, builder);
    case "ReturnStatement":
      nodePath.assertReturnStatement();
      return buildReturnStatement(nodePath, builder);
    case "VariableDeclaration":
      nodePath.assertVariableDeclaration();
      return buildVariableDeclaration(nodePath, builder);
    case "WhileStatement":
      nodePath.assertWhileStatement();
      return buildWhileStatement(nodePath, builder);
    default:
      return buildUnsupportedNode(nodePath, builder);
  }
}
