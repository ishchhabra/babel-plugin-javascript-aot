import { FunctionIR } from "../../ir/core/FunctionIR";
import { getPredecessors } from "../../frontend/cfg/getPredecessors";
import {
  BaseOptimizationPass,
  OptimizationResult,
} from "../late-optimizer/OptimizationPass";

/**
 * Removes instructions from unreachable blocks.
 *
 * After constant propagation folds branch conditions to constants, some blocks
 * become unreachable (no predecessors except the entry block). This pass
 * clears instructions from those blocks so they don't generate dead code.
 */
export class UnreachableCodeEliminationPass extends BaseOptimizationPass {
  constructor(protected readonly functionIR: FunctionIR) {
    super(functionIR);
  }

  protected step(): OptimizationResult {
    let changed = false;

    const predecessors = getPredecessors(this.functionIR.blocks);
    const entryBlockId = this.functionIR.entryBlockId;

    for (const [blockId, block] of this.functionIR.blocks) {
      // Skip the entry block — it never has predecessors but is always reachable
      if (blockId === entryBlockId) {
        continue;
      }

      const preds = predecessors.get(blockId);
      if (preds === undefined || preds.size === 0) {
        // Block is unreachable — clear its instructions
        if (block.instructions.length > 0) {
          block.instructions = [];
          changed = true;
        }
      }
    }

    return { changed };
  }
}
