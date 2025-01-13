import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildLogicalExpression(nodePath: NodePath<t.LogicalExpression>, builder: HIRBuilder): import("../../../ir").Place;
