import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { HIRBuilder } from "../../HIRBuilder";
export declare function buildLiteral(expressionPath: NodePath<t.Literal>, builder: HIRBuilder): import("../../../ir").Place;
