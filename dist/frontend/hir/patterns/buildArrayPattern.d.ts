import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildArrayPattern(nodePath: NodePath<t.ArrayPattern>, builder: HIRBuilder): Place;
