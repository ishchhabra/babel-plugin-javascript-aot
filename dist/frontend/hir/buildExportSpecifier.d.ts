import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
export declare function buildExportSpecifier(nodePath: NodePath<t.ExportSpecifier>, builder: HIRBuilder): Place;
