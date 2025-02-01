import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildForStatement(nodePath: NodePath<t.ForStatement>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder, environment: Environment): undefined;
