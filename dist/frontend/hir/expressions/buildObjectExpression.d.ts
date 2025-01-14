import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildObjectExpression(nodePath: NodePath<t.ObjectExpression>, builder: HIRBuilder): import("../../../ir").Place;
