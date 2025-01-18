import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildIfStatement(nodePath: NodePath<t.IfStatement>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): undefined;
