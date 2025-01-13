import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildUnsupportedNode } from "../buildUnsupportedNode";
import { buildArrayExpression } from "./buildArrayExpression";
import { buildAssignmentExpression } from "./buildAssignmentExpression";
import { buildBinaryExpression } from "./buildBinaryExpression";
import { buildCallExpression } from "./buildCallExpression";
import { buildLiteral } from "./buildLiteral";
import { buildLogicalExpression } from "./buildLogicalExpression";
import { buildMemberExpression } from "./buildMemberExpression";
import { buildObjectExpression } from "./buildObjectExpression";
import { buildUnaryExpression } from "./buildUnaryExpression";
import { buildUpdateExpression } from "./buildUpdateExpression";

export function buildExpression(
  nodePath: NodePath<t.Expression>,
  builder: HIRBuilder,
): Place {
  switch (nodePath.type) {
    case "AssignmentExpression":
      nodePath.assertAssignmentExpression();
      return buildAssignmentExpression(nodePath, builder);
    case "ArrayExpression":
      nodePath.assertArrayExpression();
      return buildArrayExpression(nodePath, builder);
    case "BinaryExpression":
      nodePath.assertBinaryExpression();
      return buildBinaryExpression(nodePath, builder);
    case "BooleanLiteral":
      nodePath.assertBooleanLiteral();
      return buildLiteral(nodePath, builder);
    case "CallExpression":
      nodePath.assertCallExpression();
      return buildCallExpression(nodePath, builder);
    case "LogicalExpression":
      nodePath.assertLogicalExpression();
      return buildLogicalExpression(nodePath, builder);
    case "MemberExpression":
      nodePath.assertMemberExpression();
      return buildMemberExpression(nodePath, builder);
    case "NumericLiteral":
      nodePath.assertNumericLiteral();
      return buildLiteral(nodePath, builder);
    case "ObjectExpression":
      nodePath.assertObjectExpression();
      return buildObjectExpression(nodePath, builder);
    case "StringLiteral":
      nodePath.assertStringLiteral();
      return buildLiteral(nodePath, builder);
    case "UnaryExpression":
      nodePath.assertUnaryExpression();
      return buildUnaryExpression(nodePath, builder);
    case "UpdateExpression":
      nodePath.assertUpdateExpression();
      return buildUpdateExpression(nodePath, builder);
    default:
      return buildUnsupportedNode(nodePath, builder);
  }
}
