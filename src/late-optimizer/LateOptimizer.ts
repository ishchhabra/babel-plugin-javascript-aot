import { Environment } from "../compiler";
import { BasicBlock, BlockId } from "../ir";
import { LoadStoreForwardingPass } from "./LoadStoreForwardingPass";

interface LateOptimizerResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class LateOptimizer {
  constructor(
    private readonly environment: Environment,
    private blocks: Map<BlockId, BasicBlock>
  ) {}

  public optimize(): LateOptimizerResult {
    const { blocks } = new LoadStoreForwardingPass(
      this.environment,
      this.blocks
    ).run();

    return { blocks };
  }
}
