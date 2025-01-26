/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
function makeInstructionId(id) {
    return id;
}
/**
 * Base class for all instructions.
 *
 * @param id - The unique identifier for the instruction.
 * @param place - The place where the instruction is stored.
 */
class BaseInstruction {
    id;
    place;
    nodePath;
    constructor(id, place, nodePath) {
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
    }
    /** Whether this instruction is pure. */
    get isPure() {
        return false;
    }
    toString() {
        return JSON.stringify({
            ...this,
            kind: this.constructor.name,
            nodePath: undefined,
        });
    }
}
// NOTE: The following class hierarchies are purely for organizational purposes
// and may not reflect the best way to structure these instructions.
// TODO: Rework instruction hierarchy to better reflect semantic relationships
// rather than just organizational grouping.
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
class DeclarationInstruction extends BaseInstruction {
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
class MemoryInstruction extends BaseInstruction {
}
/**
 * Module instructions represent declarations and operations that define a module's interface
 * and dependencies. These instructions handle imports and exports between modules, managing
 * how modules expose and consume functionality from one another.
 */
class ModuleInstruction extends BaseInstruction {
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
class PatternInstruction extends BaseInstruction {
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
class ValueInstruction extends BaseInstruction {
}

export { BaseInstruction, DeclarationInstruction, MemoryInstruction, ModuleInstruction, PatternInstruction, ValueInstruction, makeInstructionId };
//# sourceMappingURL=Instruction.js.map
