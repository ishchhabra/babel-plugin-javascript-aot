import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
export declare function buildVariableDeclarationBindings(bindingsPath: NodePath<t.Node>, nodePath: NodePath<t.VariableDeclaration>, functionBuilder: FunctionIRBuilder): void;
export declare function buildParameterBindings(bindingsPath: NodePath, nodePath: NodePath<t.Identifier | t.RestElement | t.Pattern>, functionBuilder: FunctionIRBuilder): void;
