import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
/**
 * Builds a place for an identifier. If the identifier is not a variable declarator,
 * a load instruction is created to load the identifier from the scope.
 */
export declare function buildIdentifier(nodePath: NodePath<t.Identifier>, builder: FunctionIRBuilder): Place;
