import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { createIdentifier, createPlace } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildVariableDeclarationBindings(
  bindingsPath: NodePath<t.Node>,
  nodePath: NodePath<t.VariableDeclaration>,
  functionBuilder: FunctionIRBuilder,
) {
  const isHoistable =
    bindingsPath.isFunctionDeclaration() && nodePath.node.kind === "var";
  const parentPath = nodePath.parentPath;
  if (
    !parentPath.isExportDeclaration() &&
    parentPath !== bindingsPath &&
    !isHoistable
  ) {
    return;
  }

  const declarationPaths = nodePath.get("declarations");
  for (const declarationPath of declarationPaths) {
    const id = declarationPath.get("id");
    buildLValBindings(bindingsPath, id, functionBuilder);
  }
}

function buildLValBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.LVal>,
  functionBuilder: FunctionIRBuilder,
) {
  switch (nodePath.type) {
    case "Identifier":
      nodePath.assertIdentifier();
      buildIdentifierBindings(bindingsPath, nodePath, functionBuilder);
      break;
    case "ArrayPattern":
      nodePath.assertArrayPattern();
      buildArrayPatternBindings(bindingsPath, nodePath, functionBuilder);
      break;
    case "ObjectPattern":
      nodePath.assertObjectPattern();
      buildObjectPatternBindings(bindingsPath, nodePath, functionBuilder);
      break;
    case "RestElement":
      nodePath.assertRestElement();
      buildRestElementBindings(bindingsPath, nodePath, functionBuilder);
      break;
    default:
      throw new Error(`Unsupported LVal type: ${nodePath.type}`);
  }
}

function buildIdentifierBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.Identifier>,
  functionBuilder: FunctionIRBuilder,
) {
  const identifier = createIdentifier(functionBuilder.environment);
  functionBuilder.registerDeclarationName(
    nodePath.node.name,
    identifier.declarationId,
    bindingsPath,
  );

  // Rename the variable name in the scope to the temporary place.
  bindingsPath.scope.rename(nodePath.node.name, identifier.name);
  functionBuilder.registerDeclarationName(
    identifier.name,
    identifier.declarationId,
    bindingsPath,
  );

  const place = createPlace(identifier, functionBuilder.environment);
  functionBuilder.registerDeclarationPlace(identifier.declarationId, place);
}

function buildArrayPatternBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.ArrayPattern>,
  functionBuilder: FunctionIRBuilder,
) {
  const elementsPath: NodePath<t.ArrayPattern["elements"][number]>[] =
    nodePath.get("elements");
  for (const elementPath of elementsPath) {
    elementPath.assertLVal();
    buildLValBindings(bindingsPath, elementPath, functionBuilder);
  }
}

function buildObjectPatternBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.ObjectPattern>,
  functionBuilder: FunctionIRBuilder,
) {
  const propertiesPath = nodePath.get("properties");
  for (const propertyPath of propertiesPath) {
    if (!propertyPath.isLVal()) {
      throw new Error(`Unsupported property type: ${propertyPath.type}`);
    }

    buildLValBindings(bindingsPath, propertyPath, functionBuilder);
  }
}

function buildRestElementBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.RestElement>,
  functionBuilder: FunctionIRBuilder,
) {
  const elementPath = nodePath.get("argument");
  buildLValBindings(bindingsPath, elementPath, functionBuilder);
}

export function buildParameterBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.Identifier | t.RestElement | t.Pattern>,
  functionBuilder: FunctionIRBuilder,
) {
  switch (nodePath.type) {
    case "Identifier":
      nodePath.assertIdentifier();
      buildIdentifierBindings(bindingsPath, nodePath, functionBuilder);
      break;
    case "RestElement":
      nodePath.assertRestElement();
      buildRestElementBindings(bindingsPath, nodePath, functionBuilder);
      break;
    default:
      throw new Error(`Unsupported parameter type: ${nodePath.type}`);
  }
}
