import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildFunctionExpression(nodePath: NodePath<t.FunctionExpression>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): import("../../../ir").Place;
