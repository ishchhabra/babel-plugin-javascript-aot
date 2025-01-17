import { BaseOptimizationPass, OptimizationResult } from "../OptimizationPass";
/**
 * A pass that forwards the source of a "Store → (neutral instructions) → Copy/Store"
 * sequence into the final store.
 *
 * For example:
 *
 * ```js
 * const temp = 10;
 * const final = temp;
 * ```
 *
 * might appear as:
 *
 *  1) `StoreLocal(place0, temp, 10)`  // temp = 10
 *  2) `BindingIdentifierInstruction(place1, "final")`
 *  3) `LoadLocal(place2, temp)`
 *  4) `StoreLocal(place3, place1, place2)` // final = temp
 *
 * We can forward `10` into the final `StoreLocal`, producing:
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
    private propagateStoreLoadStore;
}
