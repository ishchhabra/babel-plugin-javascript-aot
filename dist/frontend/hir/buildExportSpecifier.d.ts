import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
export declare function buildExportSpecifier(nodePath: NodePath<t.ExportSpecifier>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): Place;
