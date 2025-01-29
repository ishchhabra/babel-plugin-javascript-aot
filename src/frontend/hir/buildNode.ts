import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
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
  environment: Environment,
): Place | Place[] | undefined {
  if (nodePath.node === null) {
    assertNull(nodePath);
    return buildHole(nodePath, functionBuilder, environment);
  }

  assertNonNull(nodePath);
  if (nodePath.isIdentifier()) {
    return buildIdentifier(nodePath, functionBuilder, environment);
  }

  if (nodePath.isObjectMethod()) {
    return buildObjectMethod(
      nodePath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }

  if (nodePath.isObjectProperty()) {
    return buildObjectProperty(
      nodePath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }

  if (nodePath.isExpression()) {
    return buildExpression(
      nodePath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }

  if (nodePath.isStatement()) {
    return buildStatement(
      nodePath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }

  if (nodePath.isSpreadElement()) {
    return buildSpreadElement(
      nodePath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }

  if (nodePath.isPattern()) {
    return buildPattern(nodePath, functionBuilder, moduleBuilder, environment);
  }

  if (nodePath.isExportSpecifier()) {
    return buildExportSpecifier(
      nodePath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }

  return buildUnsupportedNode(nodePath, functionBuilder, environment);
}

function assertNull<T extends t.Node>(
  path: NodePath<T | null>,
): asserts path is NodePath<null> {}

function assertNonNull<T extends t.Node>(
  path: NodePath<T | null>,
): asserts path is NodePath<T> {}
