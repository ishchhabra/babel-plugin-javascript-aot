import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildPattern(nodePath: NodePath<t.Pattern | t.SpreadElement>, builder: HIRBuilder): Place;
