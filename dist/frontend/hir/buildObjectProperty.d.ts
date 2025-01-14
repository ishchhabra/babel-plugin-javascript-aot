import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../HIRBuilder";
export declare function buildObjectProperty(nodePath: NodePath<t.ObjectProperty>, builder: HIRBuilder): import("../../ir").Place;
