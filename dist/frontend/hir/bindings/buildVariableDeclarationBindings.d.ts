import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildVariableDeclarationBindings(bindingsPath: NodePath<t.Node>, nodePath: NodePath<t.VariableDeclaration>, builder: HIRBuilder): void;
export declare function buildParameterBindings(bindingsPath: NodePath, nodePath: NodePath<t.Identifier | t.RestElement | t.Pattern>, builder: HIRBuilder): void;
