import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { buildUnsupportedNode } from "../buildUnsupportedNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
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
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place | Place[] | undefined {
  switch (nodePath.type) {
    case "BlockStatement":
      nodePath.assertBlockStatement();
      return buildBlockStatement(nodePath, functionBuilder, moduleBuilder);
    case "ExportDefaultDeclaration":
      nodePath.assertExportDefaultDeclaration();
      return buildExportDefaultDeclaration(
        nodePath,
        functionBuilder,
        moduleBuilder,
      );
    case "ExportNamedDeclaration":
      nodePath.assertExportNamedDeclaration();
      return buildExportNamedDeclaration(
        nodePath,
        functionBuilder,
        moduleBuilder,
      );
    case "ForStatement":
      nodePath.assertForStatement();
      return buildForStatement(nodePath, functionBuilder, moduleBuilder);
    case "IfStatement":
      nodePath.assertIfStatement();
      return buildIfStatement(nodePath, functionBuilder, moduleBuilder);
    case "ImportDeclaration":
      nodePath.assertImportDeclaration();
      return buildImportDeclaration(nodePath, functionBuilder, moduleBuilder);
    case "ExpressionStatement":
      nodePath.assertExpressionStatement();
      return buildExpressionStatement(nodePath, functionBuilder, moduleBuilder);
    case "FunctionDeclaration":
      nodePath.assertFunctionDeclaration();
      return buildFunctionDeclaration(nodePath, functionBuilder, moduleBuilder);
    case "ReturnStatement":
      nodePath.assertReturnStatement();
      return buildReturnStatement(nodePath, functionBuilder, moduleBuilder);
    case "VariableDeclaration":
      nodePath.assertVariableDeclaration();
      return buildVariableDeclaration(nodePath, functionBuilder, moduleBuilder);
    case "WhileStatement":
      nodePath.assertWhileStatement();
      return buildWhileStatement(nodePath, functionBuilder, moduleBuilder);
    default:
      return buildUnsupportedNode(nodePath, functionBuilder);
  }
}
