import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { getFunctionName } from "../../../babel-utils";
import { createIdentifier, createPlace } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildFunctionDeclarationBindings(
  bindingsPath: NodePath<t.Node>,
  nodePath: NodePath<t.FunctionDeclaration>,
  functionBuilder: FunctionIRBuilder,
) {
  // For function declarations, we only want direct children
  // of the binding path. The nested function declarations
  // are not in the scope of the current path.
  const parentPath = nodePath.parentPath;
  if (!parentPath.isExportDefaultDeclaration() && parentPath !== bindingsPath) {
    return;
  }

  const functionName = getFunctionName(nodePath);
  if (functionName === null) {
    return;
  }

  const identifier = createIdentifier(functionBuilder.environment);
  functionBuilder.registerDeclarationName(
    functionName.node.name,
    identifier.declarationId,
    bindingsPath,
  );

  // Rename the variable name in the scope to the temporary place.
  bindingsPath.scope.rename(functionName.node.name, identifier.name);
  functionBuilder.registerDeclarationName(
    identifier.name,
    identifier.declarationId,
    bindingsPath,
  );

  const place = createPlace(identifier, functionBuilder.environment);
  functionBuilder.registerDeclarationPlace(identifier.declarationId, place);
}
