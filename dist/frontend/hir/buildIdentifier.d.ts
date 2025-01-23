import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
/**
 * Builds a place for an identifier. If the identifier is not a variable declarator,
 * a load instruction is created to load the identifier from the scope. Otherwise,
 * a binding instruction is created.
 *
 * @param nodePath - The Babel NodePath for the identifier
 * @param builder - The FunctionIRBuilder managing IR state
 * @param options.declInstrPlace - If provided, the place is recoded in the
 * environment's `declToDeclInstrPlace` mapping as the "declaration instruction
 * place" for this identifier's `DeclarationId`. In other words, if `declInstrPlace`
 * is set, the newly created or updated declaration place for this identifier is
 * associated with the provided instruction place in the IR, allowing
 * multi-declaration statements (e.g. `const a=1,b=2`) or subsequent exports
 * to reference this higher-level statement/instruction.
 *
 * @returns The `Place` representing this identifier in the IR
 */
export declare function buildIdentifier(nodePath: NodePath<t.Identifier>, builder: FunctionIRBuilder, { declInstrPlace }?: {
    declInstrPlace?: Place;
}): Place;
