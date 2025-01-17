import { BlockId } from "../ir";
import { FunctionIR } from "../ir/core/FunctionIR";
import { ModuleIR } from "../ir/core/ModuleIR";
import {
  BaseOptimizationPass,
  OptimizationResult,
} from "./late-optimizer/OptimizationPass";

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
export class MergeConsecutiveBlocksPass extends BaseOptimizationPass {
  constructor(
    protected readonly functionIR: FunctionIR,
    private readonly moduleIR: ModuleIR,
  ) {
    super(functionIR);
  }

  protected step(): OptimizationResult {
    let changed = false;

    const blockIds = [...this.functionIR.blocks.keys()];
    for (const blockId of blockIds) {
      // If the block is gone (merged in a previous iteration), skip.
      if (!this.functionIR.blocks.has(blockId)) {
        continue;
      }

      const predecessorsSet = this.functionIR.predecessors.get(blockId);
      // Skip if no predecessor set, or not exactly 1 predecessor.
      if (!predecessorsSet || predecessorsSet.size !== 1) {
        continue;
      }

      const [predecessorId] = predecessorsSet;
      // Skip if predecessor block no longer exists.
      if (!this.functionIR.blocks.has(predecessorId)) {
        continue;
      }

      // Skip if predecessor doesn't have exactly one successor, or
      // if the single successor is not the current block.
      const successorsSet = this.functionIR.successors.get(predecessorId);
      if (
        !successorsSet ||
        successorsSet.size !== 1 ||
        !successorsSet.has(blockId)
      ) {
        continue;
      }

      this.mergeBlockIntoPredecessor(predecessorId, blockId);
      changed = true;
    }

    if (changed) {
      this.functionIR.recomputeCFG();
    }

    return { changed };
  }

  /**
   * Merge `successorId` block into `predecessorId` block, and remove
   * the successor from the CFG. Also updates declToPlaces references
   * to re-home instructions from `successorId` to `predecessorId`.
   *
   * @param predecessorId The block that will absorb `successorId`.
   * @param successorId The block being merged into `predecessorId`.
   */
  private mergeBlockIntoPredecessor(
    predecessorId: BlockId,
    successorId: BlockId,
  ): void {
    const predBlock = this.functionIR.blocks.get(predecessorId)!;
    const succBlock = this.functionIR.blocks.get(successorId)!;

    // Move all successor instructions into the predecessor
    predBlock.instructions.push(...succBlock.instructions);

    // Replace the predecessor's terminal with the successor's terminal
    predBlock.terminal = succBlock.terminal;

    // Remove successorId from predecessor's successors set
    this.functionIR.successors.get(predecessorId)?.delete(successorId);

    // Update references in declToPlaces from successorId to predecessorId
    for (const [, places] of this.moduleIR.environment.declToPlaces) {
      for (const placeEntry of places) {
        if (placeEntry.blockId === successorId) {
          placeEntry.blockId = predecessorId;
        }
      }
    }

    // Remove the successor block from FunctionIR data structures
    this.functionIR.blocks.delete(successorId);
    this.functionIR.successors.delete(successorId);
    this.functionIR.predecessors.delete(successorId);
  }
}
