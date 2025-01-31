import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
/**
 * Builds a place for an identifier. If the identifier is not a variable declarator,
 * a load instruction is created to load the identifier from the scope. Otherwise,
 * a binding instruction is created.
 *
 * @param nodePath - The Babel NodePath for the identifier
 * @param builder - The FunctionIRBuilder managing IR state
 * @param environment - The environment managing IR state
 *
 * @returns The `Place` representing this identifier in the IR
 */
export declare function buildIdentifier(nodePath: NodePath<t.Identifier>, builder: FunctionIRBuilder, environment: Environment): Place;
export declare function buildBindingIdentifier(nodePath: NodePath<t.Identifier>, builder: FunctionIRBuilder, environment: Environment): Place;
