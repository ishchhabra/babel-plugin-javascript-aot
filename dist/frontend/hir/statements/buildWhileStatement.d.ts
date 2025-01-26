import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildWhileStatement(nodePath: NodePath<t.WhileStatement>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): undefined;
