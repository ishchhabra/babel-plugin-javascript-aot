import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildIfStatement(nodePath: NodePath<t.IfStatement>, builder: HIRBuilder): undefined;
