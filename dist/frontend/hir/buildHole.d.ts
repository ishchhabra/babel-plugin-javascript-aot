import { NodePath } from "@babel/traverse";
import { Environment } from "../../environment";
import { Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
export declare function buildHole(expressionPath: NodePath<null>, builder: FunctionIRBuilder, environment: Environment): Place;
