import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildUpdateExpression(nodePath: NodePath<t.UpdateExpression>, builder: HIRBuilder): import("../../../ir").Place;
