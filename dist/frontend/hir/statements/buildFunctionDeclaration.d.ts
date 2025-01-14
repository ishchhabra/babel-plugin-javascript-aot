import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildFunctionDeclaration(nodePath: NodePath<t.FunctionDeclaration>, builder: HIRBuilder): import("../../../ir").Place;
