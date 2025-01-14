import { BaseOptimizationPass, OptimizationResult } from "../OptimizationPass";
/**
 * A pass that removes redundant writes (copies) to the same location
 * when no intervening read occurs. For example:
 *
 * ```js
 * let x = 0;
 * x = 1; // This store overwrites x=0 without reading x in between
 * ```
 *
 * The second store to `x` makes the first one redundant (i.e., has no effect
 * on program behavior). This pass detects such patterns and removes the
 * earlier store.
 *
 * In IR, this might look like:
 *
 *  1) `BindingIdentifierInstruction(place0, "x")`
 *  2) `LiteralInstruction(place1, 0)`
 *  3) `StoreLocalInstruction(place2, place0, place1)`
 *  4) `BindingIdentifierInstruction(place3, "x")`
 *  5) `LiteralInstruction(place4, 1)`
 *  6) `CopyInstruction(place5, place3, place4)`
 *
 * After elimination, the IR becomes:
 *
 *  1) `BindingIdentifierInstruction(place3, "x")`
 *  2) `LiteralInstruction(place4, 1)`
 *  3) `StoreLocalInstruction(place5, place3, place4)`
 *
 * yielding more efficient code that looks like:
 *
 * ```js
 * let x = 1;
 * ```
 *
 * This optimization is particularly effective at simplifying and optimizing code
 * after phi elimination, which inserts copy instructions, by reducing redundant
 * sequences and eliminating unnecessary temporary variables.
 */
export declare class RedundantCopyEliminationPass extends BaseOptimizationPass {
    protected step(): OptimizationResult;
    /**
     * Scans the instructions in a basic block to remove redundant stores/copies.
     * A "redundant write" is a CopyInstruction to the same declarationId that is
     * not read before the next write.
     */
    private eliminateRedundantCopiesInBlock;
}
