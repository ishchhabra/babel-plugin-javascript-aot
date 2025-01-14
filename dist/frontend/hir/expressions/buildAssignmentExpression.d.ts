import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildAssignmentExpression(nodePath: NodePath<t.AssignmentExpression>, builder: HIRBuilder): import("../../../ir").Place;
