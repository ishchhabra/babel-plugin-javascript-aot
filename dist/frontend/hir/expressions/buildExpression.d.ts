import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildExpression(nodePath: NodePath<t.Expression>, builder: HIRBuilder): Place;
