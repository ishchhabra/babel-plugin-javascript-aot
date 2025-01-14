import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildExportNamedDeclaration(nodePath: NodePath<t.ExportNamedDeclaration>, builder: HIRBuilder): import("../../../ir").Place;
