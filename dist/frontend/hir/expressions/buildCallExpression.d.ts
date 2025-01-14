import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildCallExpression(expressionPath: NodePath<t.CallExpression>, builder: HIRBuilder): Place;
