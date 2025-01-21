import { FunctionIR } from "../ir/core/FunctionIR";
import { ModuleIR } from "../ir/core/ModuleIR";
import { BaseOptimizationPass, OptimizationResult } from "./late-optimizer/OptimizationPass";
/**
 * A pass that merges consecutive blocks where the CFG is linear:
 *   predecessor -> successor
 *
 * Specifically, if:
 *   - predecessor has exactly one successor (successorId)
 *   - successor has exactly one predecessor (predecessorId)
 *
 * then we merge the successor's instructions into the predecessor, removing
 * the unnecessary block boundary.
 */
export declare class MergeConsecutiveBlocksPass extends BaseOptimizationPass {
    protected readonly functionIR: FunctionIR;
    private readonly moduleIR;
    constructor(functionIR: FunctionIR, moduleIR: ModuleIR);
    protected step(): OptimizationResult;
    /**
     * Merge `successorId` block into `predecessorId` block, and remove
     * the successor from the CFG. Also updates declToPlaces references
     * to re-home instructions from `successorId` to `predecessorId`.
     *
     * @param predecessorId The block that will absorb `successorId`.
     * @param successorId The block being merged into `predecessorId`.
     */
    private mergeBlockIntoPredecessor;
}
