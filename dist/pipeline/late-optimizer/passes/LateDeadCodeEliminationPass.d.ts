import { BaseOptimizationPass, OptimizationResult } from "../OptimizationPass";
/**
 * A late Dead Code Elimination (DCE) pass that removes unused instructions
 * which define a place not read by any other instruction in the block
 * (and have no side effects). This pass is less aggressive than the
 * early DCE pass, which runs before the SSA elimination and has access
 * to phi nodes information.
 *
 * It relies on each instruction implementing:
 *    `public getReadPlaces(): Place[] { ... }`
 * which returns the list of places that instruction *reads*.
 *
 * Also, each instruction that "defines" a place should do so in a known field
 * (e.g. `lval` for StoreLocal, or `argumentPlace` for a BinaryExpression, etc.).
 *
 * For instructions that are "pure" and produce a result that no one reads, we remove them.
 * If an instruction is "impure" (side effects, function calls, etc.), we keep it even if unused.
 *
 * NOTE: This pass is local. If a variable is used in a different block,
 * we won't see it here and might remove it incorrectly if you haven't accounted for that globally.
 */
export declare class LateDeadCodeEliminationPass extends BaseOptimizationPass {
    protected step(): OptimizationResult;
    private eliminateDeadCodeInBlock;
    /**
     * Decide if we keep this instruction:
     *   1) If it doesn't "define" any place, we keep it by default unless
     *      it's a pure instruction with no side effects (like a pure call returning
     *      a value that is never used).
     *   2) If it's pure (like a store or copy with no side effects) and
     *      defines a place that is not in usedPlaceIds, remove it.
     *   3) Otherwise keep it.
     */
    private shouldKeepInstruction;
}
