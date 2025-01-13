import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
export declare function buildNode(nodePath: NodePath<t.Node | null>, builder: HIRBuilder): Place | Place[] | undefined;
