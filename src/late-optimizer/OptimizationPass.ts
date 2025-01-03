import { Environment } from "../compiler";
import { BasicBlock, BlockId } from "../ir";

export interface OptimizationResult {
  changed: boolean;
}

export abstract class BaseOptimizationPass {
  constructor(
    protected readonly environment: Environment,
    protected blocks: Map<BlockId, BasicBlock>
  ) {}

  public run() {
    let continueOptimizing = true;

    while (continueOptimizing) {
      const result = this.step();
      if (!result.changed) {
        continueOptimizing = false;
      }
    }

    return { blocks: this.blocks };
  }

  protected abstract step(): OptimizationResult;
}
