import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
export declare function buildFunctionParams(paramPaths: NodePath<t.Identifier | t.RestElement | t.Pattern>[], bodyPath: NodePath, functionBuilder: FunctionIRBuilder, environment: Environment): Place[];
