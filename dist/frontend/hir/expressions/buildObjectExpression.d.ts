import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
export declare function buildObjectExpression(nodePath: NodePath<t.ObjectExpression>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): import("../../../ir").Place;
