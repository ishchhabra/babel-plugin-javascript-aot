import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { getFunctionName } from "../../../babel-utils";
import { createIdentifier, createPlace } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";

export function buildFunctionDeclarationBindings(
  bindingsPath: NodePath<t.Node>,
  nodePath: NodePath<t.FunctionDeclaration>,
  builder: HIRBuilder,
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

  const identifier = createIdentifier(builder.environment);
  builder.registerDeclarationName(
    functionName.node.name,
    identifier.declarationId,
    bindingsPath,
  );

  // Rename the variable name in the scope to the temporary place.
  bindingsPath.scope.rename(functionName.node.name, identifier.name);
  builder.registerDeclarationName(
    identifier.name,
    identifier.declarationId,
    bindingsPath,
  );

  const place = createPlace(identifier, builder.environment);
  builder.registerDeclarationPlace(identifier.declarationId, place);
}
