import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildReturnStatement(nodePath: NodePath<t.ReturnStatement>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): undefined;
