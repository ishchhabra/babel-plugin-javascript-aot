import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
export declare function buildLiteral(expressionPath: NodePath<t.Literal>, functionBuilder: FunctionIRBuilder): import("../../../ir").Place;
