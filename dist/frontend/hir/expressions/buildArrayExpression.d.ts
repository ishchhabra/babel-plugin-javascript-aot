import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildArrayExpression(nodePath: NodePath<t.ArrayExpression>, builder: HIRBuilder): import("../../../ir").Place;
