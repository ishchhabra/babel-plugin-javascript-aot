import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { buildUnsupportedNode } from "../buildUnsupportedNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildArrayExpression } from "./buildArrayExpression";
import { buildAssignmentExpression } from "./buildAssignmentExpression";
import { buildBinaryExpression } from "./buildBinaryExpression";
import { buildCallExpression } from "./buildCallExpression";
import { buildFunctionExpression } from "./buildFunctionExpression";
import { buildLiteral } from "./buildLiteral";
import { buildLogicalExpression } from "./buildLogicalExpression";
import { buildMemberExpression } from "./buildMemberExpression";
import { buildObjectExpression } from "./buildObjectExpression";
import { buildUnaryExpression } from "./buildUnaryExpression";
import { buildUpdateExpression } from "./buildUpdateExpression";

export function buildExpression(
  nodePath: NodePath<t.Expression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place {
  switch (nodePath.type) {
    case "AssignmentExpression":
      nodePath.assertAssignmentExpression();
      return buildAssignmentExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
      );
    case "ArrayExpression":
      nodePath.assertArrayExpression();
      return buildArrayExpression(nodePath, functionBuilder, moduleBuilder);
    case "BinaryExpression":
      nodePath.assertBinaryExpression();
      return buildBinaryExpression(nodePath, functionBuilder, moduleBuilder);
    case "BooleanLiteral":
      nodePath.assertBooleanLiteral();
      return buildLiteral(nodePath, functionBuilder);
    case "CallExpression":
      nodePath.assertCallExpression();
      return buildCallExpression(nodePath, functionBuilder, moduleBuilder);
    case "FunctionExpression":
      nodePath.assertFunctionExpression();
      return buildFunctionExpression(nodePath, functionBuilder, moduleBuilder);
    case "LogicalExpression":
      nodePath.assertLogicalExpression();
      return buildLogicalExpression(nodePath, functionBuilder, moduleBuilder);
    case "MemberExpression":
      nodePath.assertMemberExpression();
      return buildMemberExpression(nodePath, functionBuilder, moduleBuilder);
    case "NumericLiteral":
      nodePath.assertNumericLiteral();
      return buildLiteral(nodePath, functionBuilder);
    case "ObjectExpression":
      nodePath.assertObjectExpression();
      return buildObjectExpression(nodePath, functionBuilder, moduleBuilder);
    case "StringLiteral":
      nodePath.assertStringLiteral();
      return buildLiteral(nodePath, functionBuilder);
    case "UnaryExpression":
      nodePath.assertUnaryExpression();
      return buildUnaryExpression(nodePath, functionBuilder, moduleBuilder);
    case "UpdateExpression":
      nodePath.assertUpdateExpression();
      return buildUpdateExpression(nodePath, functionBuilder, moduleBuilder);
    default:
      return buildUnsupportedNode(nodePath, functionBuilder);
  }
}
