import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { type Place } from "../core";
import { type Identifier } from "../core/Identifier";
/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
declare const opaqueInstructionId: unique symbol;
export type InstructionId = number & {
    [opaqueInstructionId]: "InstructionId";
};
export declare function makeInstructionId(id: number): InstructionId;
/**
 * Base class for all instructions.
 *
 * @param id - The unique identifier for the instruction.
 * @param place - The place where the instruction is stored.
 */
export declare abstract class BaseInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node | null> | undefined;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node | null> | undefined);
    /**
     * Rewrites the instruction to use values.
     *
     * @param values - A map of old values to new values.
     * @returns The rewritten instruction.
     */
    abstract rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    /**
     * Return a set of place IDs that this instruction *reads* (uses).
     */
    abstract getReadPlaces(): Place[];
    /** Whether this instruction is pure. */
    get isPure(): boolean;
    toString(): string;
}
/**
 * Declaration instructions represent operations that introduce new named entities
 * in the program, such as functions and classes.
 *
 * Examples:
 * - FunctionDeclarationInstruction: Represents function declarations
 *   e.g., `function foo() {}`
 *
 * - ClassDeclarationInstruction: Represents class declarations
 *   e.g., `class Bar {}`
 *
 * Note: Variable declarations (e.g., `let x = 5`) are not represented by a dedicated
 * declaration instruction, but rather use StoreLocal memory instructions.
 * If support for declaring multiple variables in a single statement (e.g., `let x = 1, y = 2`)
 * becomes necessary, a dedicated instruction may be introduced in the future.
 */
export declare abstract class DeclarationInstruction extends BaseInstruction {
}
/**
 * JSX instructions represent operations related to JSX.
 *
 * Examples:
 * - JSXElementInstruction: Represents JSX elements
 *   e.g., `<div />`
 *
 * - JSXFragmentInstruction: Represents JSX fragments
 *   e.g., `<></>`
 */
export declare abstract class JSXInstruction extends BaseInstruction {
}
/**
/**
 * Memory instructions represent operations that manipulate the program's memory.
 *
 * Examples:
 * - StoreLocalInstruction: Represents storing a value at a place
 *   e.g., `let x = 5`
 *
 * - LoadLocalInstruction: Represents loading a value from a place
 *   e.g., `x`
 */
export declare abstract class MemoryInstruction extends BaseInstruction {
}
/**
 * Module instructions represent declarations and operations that define a module's interface
 * and dependencies. These instructions handle imports and exports between modules, managing
 * how modules expose and consume functionality from one another.
 */
export declare abstract class ModuleInstruction extends BaseInstruction {
}
/**
 * Pattern instructions represent operations that match patterns in the program.
 *
 * Examples:
 * - ArrayPatternInstruction: Represents an array pattern
 *   e.g., `[x, y]`
 *
 * - ObjectPatternInstruction: Represents an object pattern
 *   e.g., `{ x, y }`
 */
export declare abstract class PatternInstruction extends BaseInstruction {
}
/**
 * Value instructions represent operations that compute or produce values in the IR.
 * These instructions form the core computational elements, handling operations that
 * result in a value being stored in their associated place.
 *
 * Examples:
 * - LiteralInstruction: Represents primitive values like numbers or strings
 *   e.g., `42` or `"hello"`
 *
 * - BinaryExpressionInstruction: Represents operations between two values
 *   e.g., `a + b` or `x * y`
 *
 * - ArrayExpressionInstruction: Represents array creation
 *   e.g., `[1, 2, 3]`
 */
export declare abstract class ValueInstruction extends BaseInstruction {
}
export {};
