import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { buildExportSpecifier } from "./buildExportSpecifier";
import { buildIdentifier } from "./buildIdentifier";
import { buildObjectMethod } from "./buildObjectMethod";
import { buildObjectProperty } from "./buildObjectProperty";
import { buildSpreadElement } from "./buildSpreadElement";
import { buildUnsupportedNode } from "./buildUnsupportedNode";
import { buildHole } from "./expressions";
import { buildExpression } from "./expressions/buildExpression";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
import { buildPattern } from "./patterns/buildPattern";
import { buildStatement } from "./statements/buildStatement";

export function buildNode(
  nodePath: NodePath<t.Node | null>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place | Place[] | undefined {
  if (nodePath.node === null) {
    assertNull(nodePath);
    return buildHole(nodePath, functionBuilder);
  }

  assertNonNull(nodePath);
  if (nodePath.isIdentifier()) {
    return buildIdentifier(nodePath, functionBuilder);
  }

  if (nodePath.isObjectMethod()) {
    return buildObjectMethod(nodePath, functionBuilder, moduleBuilder);
  }

  if (nodePath.isObjectProperty()) {
    return buildObjectProperty(nodePath, functionBuilder, moduleBuilder);
  }

  if (nodePath.isExpression()) {
    return buildExpression(nodePath, functionBuilder, moduleBuilder);
  }

  if (nodePath.isStatement()) {
    return buildStatement(nodePath, functionBuilder, moduleBuilder);
  }

  if (nodePath.isSpreadElement()) {
    return buildSpreadElement(nodePath, functionBuilder, moduleBuilder);
  }

  if (nodePath.isPattern()) {
    return buildPattern(nodePath, functionBuilder, moduleBuilder);
  }

  if (nodePath.isExportSpecifier()) {
    return buildExportSpecifier(nodePath, functionBuilder, moduleBuilder);
  }

  return buildUnsupportedNode(nodePath, functionBuilder);
}

function assertNull<T extends t.Node>(
  path: NodePath<T | null>,
): asserts path is NodePath<null> {}

function assertNonNull<T extends t.Node>(
  path: NodePath<T | null>,
): asserts path is NodePath<T> {}
