import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
export declare function buildObjectMethod(nodePath: NodePath<t.ObjectMethod>, builder: HIRBuilder): Place;
