import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { Place } from "../../../ir";
import { buildUnsupportedNode } from "../buildUnsupportedNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildArrayExpression } from "./buildArrayExpression";
import { buildArrowFunctionExpression } from "./buildArrowFunctionExpression";
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
  environment: Environment,
): Place {
  switch (nodePath.type) {
    case "AssignmentExpression":
      nodePath.assertAssignmentExpression();
      return buildAssignmentExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "ArrayExpression":
      nodePath.assertArrayExpression();
      return buildArrayExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "ArrowFunctionExpression":
      nodePath.assertArrowFunctionExpression();
      return buildArrowFunctionExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "BinaryExpression":
      nodePath.assertBinaryExpression();
      return buildBinaryExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "BooleanLiteral":
      nodePath.assertBooleanLiteral();
      return buildLiteral(nodePath, functionBuilder, environment);
    case "CallExpression":
      nodePath.assertCallExpression();
      return buildCallExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "FunctionExpression":
      nodePath.assertFunctionExpression();
      return buildFunctionExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "LogicalExpression":
      nodePath.assertLogicalExpression();
      return buildLogicalExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "MemberExpression":
      nodePath.assertMemberExpression();
      return buildMemberExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "NumericLiteral":
      nodePath.assertNumericLiteral();
      return buildLiteral(nodePath, functionBuilder, environment);
    case "ObjectExpression":
      nodePath.assertObjectExpression();
      return buildObjectExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "StringLiteral":
      nodePath.assertStringLiteral();
      return buildLiteral(nodePath, functionBuilder, environment);
    case "UnaryExpression":
      nodePath.assertUnaryExpression();
      return buildUnaryExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    case "UpdateExpression":
      nodePath.assertUpdateExpression();
      return buildUpdateExpression(
        nodePath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
    default:
      return buildUnsupportedNode(nodePath, functionBuilder, environment);
  }
}
