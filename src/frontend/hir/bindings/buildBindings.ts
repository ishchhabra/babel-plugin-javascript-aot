import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { buildFunctionDeclarationBindings } from "./buildFunctionDeclarationBindings";
import {
  buildParameterBindings,
  buildVariableDeclarationBindings,
} from "./buildVariableDeclarationBindings";

export function buildBindings(
  bindingsPath: NodePath,
  functionBuilder: FunctionIRBuilder,
) {
  bindingsPath.traverse({
    FunctionDeclaration: (path: NodePath<t.FunctionDeclaration>) => {
      buildFunctionDeclarationBindings(bindingsPath, path, functionBuilder);
    },
    VariableDeclaration: (path: NodePath<t.VariableDeclaration>) => {
      buildVariableDeclarationBindings(bindingsPath, path, functionBuilder);
    },
  });

  // Register the parameter bindings for function declarations.
  if (bindingsPath.isFunctionDeclaration() || bindingsPath.isObjectMethod()) {
    const paramPaths = bindingsPath.get("params");
    if (!Array.isArray(paramPaths)) {
      throw new Error(`Expected params to be an array`);
    }

    for (const paramPath of paramPaths) {
      if (
        !paramPath.isIdentifier() &&
        !paramPath.isRestElement() &&
        !paramPath.isPattern()
      ) {
        throw new Error(`Unsupported parameter type: ${paramPath.type}`);
      }

      buildParameterBindings(bindingsPath, paramPath, functionBuilder);
    }
  }
}
