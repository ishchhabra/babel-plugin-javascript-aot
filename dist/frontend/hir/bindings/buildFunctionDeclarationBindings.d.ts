import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
export declare function buildFunctionDeclarationBindings(bindingsPath: NodePath<t.Node>, nodePath: NodePath<t.FunctionDeclaration>, functionBuilder: FunctionIRBuilder, environment: Environment): void;
