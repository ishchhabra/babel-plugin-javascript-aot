import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildVariableDeclarationBindings(
  bindingsPath: NodePath<t.Node>,
  nodePath: NodePath<t.VariableDeclaration>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
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
    buildLValBindings(bindingsPath, id, functionBuilder, environment);
  }
}

function buildLValBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.LVal>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  switch (nodePath.type) {
    case "Identifier":
      nodePath.assertIdentifier();
      buildIdentifierBindings(
        bindingsPath,
        nodePath,
        functionBuilder,
        environment,
      );
      break;
    case "ArrayPattern":
      nodePath.assertArrayPattern();
      buildArrayPatternBindings(
        bindingsPath,
        nodePath,
        functionBuilder,
        environment,
      );
      break;
    case "ObjectPattern":
      nodePath.assertObjectPattern();
      buildObjectPatternBindings(
        bindingsPath,
        nodePath,
        functionBuilder,
        environment,
      );
      break;
    case "RestElement":
      nodePath.assertRestElement();
      buildRestElementBindings(
        bindingsPath,
        nodePath,
        functionBuilder,
        environment,
      );
      break;
    default:
      throw new Error(`Unsupported LVal type: ${nodePath.type}`);
  }
}

function buildIdentifierBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.Identifier>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  const identifier = environment.createIdentifier();
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

  const place = environment.createPlace(identifier);
  environment.registerDeclaration(
    identifier.declarationId,
    functionBuilder.currentBlock.id,
    place.id,
  );
}

function buildArrayPatternBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.ArrayPattern>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  const elementsPath: NodePath<t.ArrayPattern["elements"][number]>[] =
    nodePath.get("elements");
  for (const elementPath of elementsPath) {
    elementPath.assertLVal();
    buildLValBindings(bindingsPath, elementPath, functionBuilder, environment);
  }
}

function buildObjectPatternBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.ObjectPattern>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  const propertiesPath = nodePath.get("properties");
  for (const propertyPath of propertiesPath) {
    if (!propertyPath.isLVal()) {
      throw new Error(`Unsupported property type: ${propertyPath.type}`);
    }

    buildLValBindings(bindingsPath, propertyPath, functionBuilder, environment);
  }
}

function buildRestElementBindings(
  bindingsPath: NodePath,
  nodePath: NodePath<t.RestElement>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  const elementPath = nodePath.get("argument");
  buildLValBindings(bindingsPath, elementPath, functionBuilder, environment);
}
