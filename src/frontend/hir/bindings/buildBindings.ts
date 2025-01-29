import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { buildFunctionDeclarationBindings } from "./buildFunctionDeclarationBindings";
import { buildVariableDeclarationBindings } from "./buildVariableDeclarationBindings";

export function buildBindings(
  bindingsPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  bindingsPath.traverse({
    FunctionDeclaration: (path: NodePath<t.FunctionDeclaration>) => {
      buildFunctionDeclarationBindings(
        bindingsPath,
        path,
        functionBuilder,
        environment,
      );
    },
    VariableDeclaration: (path: NodePath<t.VariableDeclaration>) => {
      buildVariableDeclarationBindings(
        bindingsPath,
        path,
        functionBuilder,
        environment,
      );
    },
  });
}
