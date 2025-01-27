import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { buildFunctionDeclarationBindings } from "./buildFunctionDeclarationBindings";
import { buildVariableDeclarationBindings } from "./buildVariableDeclarationBindings";

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
}
