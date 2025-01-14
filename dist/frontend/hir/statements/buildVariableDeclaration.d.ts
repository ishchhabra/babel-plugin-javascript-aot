import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildVariableDeclaration(nodePath: NodePath<t.VariableDeclaration>, builder: HIRBuilder): Place | Place[] | undefined;
