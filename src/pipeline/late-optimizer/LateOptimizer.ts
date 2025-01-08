import { CompilerOptions } from "../../compile";
import { Environment } from "../../environment";
import { BasicBlock, BlockId } from "../../frontend/ir";
import { LateDeadCodeEliminationPass } from "./passes/LateDeadCodeEliminationPass";
import { LoadStoreForwardingPass } from "./passes/LoadStoreForwardingPass";

interface LateOptimizerResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class LateOptimizer {
  constructor(
    private readonly options: CompilerOptions,
    private readonly environment: Environment,
    private blocks: Map<BlockId, BasicBlock>,
    private postOrder: Array<BlockId>,
  ) {}

  public optimize(): LateOptimizerResult {
    let blocks = this.blocks;
    if (this.options.enableLoadStoreForwardingPass) {
      const loadStoreForwardingResult = new LoadStoreForwardingPass(
        this.environment,
        this.blocks,
        this.postOrder,
      ).run();
      blocks = loadStoreForwardingResult.blocks;
    }

    if (this.options.enableLateDeadCodeEliminationPass) {
      const lateDeadCodeEliminationResult = new LateDeadCodeEliminationPass(
        this.environment,
        blocks,
        this.postOrder,
      ).run();
      blocks = lateDeadCodeEliminationResult.blocks;
    }

    return { blocks };
  }
}
