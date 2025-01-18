import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
export declare function buildObjectProperty(nodePath: NodePath<t.ObjectProperty>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): import("../../ir").Place;
