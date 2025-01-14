import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildUnaryExpression(nodePath: NodePath<t.UnaryExpression>, builder: HIRBuilder): import("../../../ir").Place;
