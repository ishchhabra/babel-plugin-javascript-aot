import { CompilerOptions } from "../compile";
import { Environment } from "../environment";
import { BasicBlock, BlockId } from "../frontend/ir";
import { ConstantPropagationPass } from "./passes/ConstantPropagationPass";
import { SSABuilder } from "./ssa/SSABuilder";
import { SSAEliminator } from "./ssa/SSAEliminator";

export interface PipelineResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class Pipeline {
  constructor(private readonly options: CompilerOptions) {}

  public run(
    path: string,
    blocks: Map<BlockId, BasicBlock>,
    predecessors: Map<BlockId, Set<BlockId>>,
    dominators: Map<BlockId, Set<BlockId>>,
    dominanceFrontier: Map<BlockId, Set<BlockId>>,
    environment: Environment,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = new Map<string, any>();

    const ssaBuilderResult = new SSABuilder(
      predecessors,
      dominanceFrontier,
      environment,
    ).build();
    new SSAEliminator(
      environment,
      blocks,
      dominators,
      ssaBuilderResult.phis,
    ).eliminate();

    if (this.options.enableConstantPropagationPass) {
      const constantPropagationResult = new ConstantPropagationPass(
        path,
        blocks,
        context,
      ).run();
      blocks = constantPropagationResult.blocks;
    }

    return { blocks };
  }
}
