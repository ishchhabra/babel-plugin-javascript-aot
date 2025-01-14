import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildExportDefaultDeclaration(nodePath: NodePath<t.ExportDefaultDeclaration>, builder: HIRBuilder): import("../../../ir").Place;
