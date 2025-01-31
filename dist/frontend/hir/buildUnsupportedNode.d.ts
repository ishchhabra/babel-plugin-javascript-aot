import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
export declare function buildUnsupportedNode(nodePath: NodePath<t.Node>, functionBuilder: FunctionIRBuilder, environment: Environment): Place;
