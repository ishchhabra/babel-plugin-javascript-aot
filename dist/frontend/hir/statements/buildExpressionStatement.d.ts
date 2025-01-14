import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildExpressionStatement(nodePath: NodePath<t.ExpressionStatement>, builder: HIRBuilder): Place | undefined;
