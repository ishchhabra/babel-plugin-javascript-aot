import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
export declare function buildImportSpecifier(nodePath: NodePath<t.ImportSpecifier>, builder: HIRBuilder): Place;
