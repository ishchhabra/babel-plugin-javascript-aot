import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
import { buildExportSpecifier } from "./buildExportSpecifier";
import { buildIdentifier } from "./buildIdentifier";
import { buildImportSpecifier } from "./buildImportSpecifier";
import { buildObjectMethod } from "./buildObjectMethod";
import { buildObjectProperty } from "./buildObjectProperty";
import { buildSpreadElement } from "./buildSpreadElement";
import { buildUnsupportedNode } from "./buildUnsupportedNode";
import { buildHole } from "./expressions";
import { buildExpression } from "./expressions/buildExpression";
import { buildPattern } from "./patterns/buildPattern";
import { buildStatement } from "./statements/buildStatement";

export function buildNode(
  nodePath: NodePath<t.Node | null>,
  builder: HIRBuilder,
): Place | Place[] | undefined {
  if (nodePath.node === null) {
    assertNull(nodePath);
    return buildHole(nodePath, builder);
  }

  assertNonNull(nodePath);
  if (nodePath.isIdentifier()) {
    return buildIdentifier(nodePath, builder);
  }

  if (nodePath.isObjectMethod()) {
    return buildObjectMethod(nodePath, builder);
  }

  if (nodePath.isObjectProperty()) {
    return buildObjectProperty(nodePath, builder);
  }

  if (nodePath.isExpression()) {
    return buildExpression(nodePath, builder);
  }

  if (nodePath.isStatement()) {
    return buildStatement(nodePath, builder);
  }

  if (nodePath.isSpreadElement()) {
    return buildSpreadElement(nodePath, builder);
  }

  if (nodePath.isPattern()) {
    return buildPattern(nodePath, builder);
  }

  if (nodePath.isImportSpecifier()) {
    return buildImportSpecifier(nodePath, builder);
  }

  if (nodePath.isExportSpecifier()) {
    return buildExportSpecifier(nodePath, builder);
  }

  return buildUnsupportedNode(nodePath, builder);
}

function assertNull<T extends t.Node>(
  path: NodePath<T | null>,
): asserts path is NodePath<null> {}

function assertNonNull<T extends t.Node>(
  path: NodePath<T | null>,
): asserts path is NodePath<T> {}
