import { Environment } from "../compiler/environment";
import { BasicBlock, BlockId, makeBlockId } from "../ir";
import { BranchTerminal, JumpTerminal } from "../ir/Terminal";
import {
  getDominanceFrontier,
  getDominators,
  getImmediateDominators,
} from "../ssa/dominator-utils";

interface CFG {
  predecessors: Map<BlockId, Set<BlockId>>;
  backEdges: Map<BlockId, Set<BlockId>>;
}

export class CFGBuilder {
  constructor(
    private readonly environment: Environment,
    private readonly blocks: Map<BlockId, BasicBlock>
  ) {}

  public build(): CFG {
    const predecessors = this.getPredecessors();
    this.environment.dominators = getDominators(predecessors, makeBlockId(0));
    this.environment.immediateDominators = getImmediateDominators(
      this.environment.dominators
    );
    this.environment.dominanceFrontier = getDominanceFrontier(
      predecessors,
      this.environment.immediateDominators
    );
    const backEdges = this.getBackEdges(predecessors);
    return { predecessors, backEdges };
  }

  private getPredecessors(): Map<BlockId, Set<BlockId>> {
    const predecessors = new Map<BlockId, Set<BlockId>>();
    const visited = new Set<BlockId>();

    // Initialize empty predecessor sets
    for (const blockId of this.blocks.keys()) {
      predecessors.set(blockId, new Set());
    }

    const processBlock = (
      blockId: BlockId,
      prevBlock: BasicBlock | undefined
    ) => {
      const block = this.blocks.get(blockId);
      if (block === undefined) {
        return;
      }

      // Add predecessor if we came from a previous block
      if (prevBlock !== undefined) {
        predecessors.get(blockId)?.add(prevBlock.id);
      }

      // Skip if already visited to handle cycles
      if (visited.has(blockId)) return;
      visited.add(blockId);

      // Visit successors based on terminal type
      if (block.terminal instanceof JumpTerminal) {
        processBlock(block.terminal.target, block);
      } else if (block.terminal instanceof BranchTerminal) {
        processBlock(block.terminal.consequent, block);
        processBlock(block.terminal.alternate, block);
      }
    };

    // Start from entry block (assumed to be block 0)
    processBlock(makeBlockId(0), undefined);
    return predecessors;
  }

  private getBackEdges(
    predecessors: Map<BlockId, Set<BlockId>>
  ): Map<BlockId, Set<BlockId>> {
    const backEdges = new Map<BlockId, Set<BlockId>>();

    // Initialize empty sets for all blocks
    for (const blockId of this.blocks.keys()) {
      backEdges.set(blockId, new Set());
    }

    for (const [blockId, preds] of predecessors.entries()) {
      const dominatedByBlock = Array.from(this.blocks.keys()).filter((b) =>
        this.environment.dominators.get(b)?.has(blockId)
      );

      for (const pred of preds) {
        if (dominatedByBlock.includes(pred)) {
          // Add the predecessor to the set of back edges for this block
          backEdges.get(blockId)?.add(pred);
        }
      }
    }

    return backEdges;
  }
}