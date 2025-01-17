import { NodePath } from "@babel/traverse";
import { Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
export declare function buildHole(expressionPath: NodePath<null>, builder: FunctionIRBuilder): Place;
