import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildReturnStatement(nodePath: NodePath<t.ReturnStatement>, builder: HIRBuilder): undefined;
