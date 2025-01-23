import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
export declare function buildImportSpecifier(specifierNodePath: NodePath<t.ImportSpecifier | t.ImportDefaultSpecifier>, declarationNodePath: NodePath<t.ImportDeclaration>, functionBuilder: FunctionIRBuilder, moduleBuilder: ModuleIRBuilder): import("../../ir").Place;
