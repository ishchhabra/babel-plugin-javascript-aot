import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
export declare function buildLiteral(expressionPath: NodePath<t.Literal>, functionBuilder: FunctionIRBuilder, environment: Environment): import("../../../ir").Place;
