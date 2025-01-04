import { BaseOptimizationPass, OptimizationResult } from "../OptimizationPass";
/**
 * A pass that forwards the source of a "Store → (expression instructions) → Copy"
 * sequence into the final store. For example:
 *
 * ```js
 * const temp = 10;    // (1)
 * const final = temp;  // (2)
 * ```
 *
 * In IR, this might appear as three instructions in the same block:
 *
 *  1) `StoreLocal(place0, temp, 10)`        // temp = 10
 *  2) `LoadLocal(place1, temp)`
 *  3) `Copy(place2, final, place1)`  // final = temp
 *
 * This pass **forwards** the value `10` directly into the final Copy,
 * producing:
 *
 * ```js
 * const temp = 10;
 * const final = 10;
 * ```
 *
 * This optimization is particularly effective at simplifying and optimizing code
 * after phi elimination, which inserts copy instructions, by reducing redundant
 * sequences and eliminating unnecessary temporary variables.
 */
export declare class LoadStoreForwardingPass extends BaseOptimizationPass {
    protected step(): OptimizationResult;
    /**
     * Scans for consecutive triples:
     *
     *   StoreLocal(place0, temp, X)
     *   LoadLocal(place1, temp)
     *   StoreLocal(place2, final, place1)
     *
     * If found, we rewrite the final store to `StoreLocal(final, X)`,
     * but keep the first two instructions exactly as-is.
     */
    private propagateStoreLoadStore;
}
