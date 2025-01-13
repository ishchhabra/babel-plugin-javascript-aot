import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildFunctionDeclarationBindings(bindingsPath: NodePath<t.Node>, nodePath: NodePath<t.FunctionDeclaration>, builder: HIRBuilder): void;
