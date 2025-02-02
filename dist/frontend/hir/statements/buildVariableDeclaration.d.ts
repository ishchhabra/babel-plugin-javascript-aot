import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { Place } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildVariableDeclaration(nodePath: NodePath<t.VariableDeclaration>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder, environment: Environment): Place | Place[] | undefined;
