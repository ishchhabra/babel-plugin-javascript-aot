import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildBinaryExpression(nodePath: NodePath<t.BinaryExpression>, builder: HIRBuilder): import("../../../ir").Place;