import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildMemberExpression(nodePath: NodePath<t.MemberExpression>, builder: HIRBuilder): import("../../../ir").Place;
