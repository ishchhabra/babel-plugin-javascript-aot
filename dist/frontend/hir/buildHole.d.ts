import { NodePath } from "@babel/traverse";
import { Place } from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
export declare function buildHole(expressionPath: NodePath<null>, builder: HIRBuilder): Place;
