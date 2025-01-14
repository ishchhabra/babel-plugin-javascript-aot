import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildImportDeclaration(nodePath: NodePath<t.ImportDeclaration>, builder: HIRBuilder): import("../../../ir").Place;
