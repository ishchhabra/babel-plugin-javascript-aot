import { CompilerOptions } from "../compile";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../ir";
import { CallGraphBuilder } from "./analysis/CallGraph";
import { LateOptimizer } from "./late-optimizer/LateOptimizer";
import { MergeConsecutiveBlocksPass } from "./MergeConsecutiveBlocksPass";
import { Optimizer } from "./optimizer/Optimizer";
import { SSABuilder } from "./ssa/SSABuilder";
import { SSAEliminator } from "./ssa/SSAEliminator";

export interface PipelineResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class Pipeline {
  constructor(
    private readonly projectUnit: ProjectUnit,
    private readonly options: CompilerOptions,
  ) {}

  public run() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const context = new Map<string, any>();

    for (const moduleName of this.projectUnit.postOrder.toReversed()) {
      const moduleIR = this.projectUnit.modules.get(moduleName)!;
      const callGraph = new CallGraphBuilder(moduleIR).build();
      for (const functionIR of moduleIR.functions.values()) {
        new MergeConsecutiveBlocksPass(functionIR, moduleIR).run();

        const ssaBuilderResult = new SSABuilder(functionIR, moduleIR).build();

        if (this.options.enableOptimizer) {
          const optimizerResult = new Optimizer(
            functionIR,
            moduleIR,
            callGraph,
            ssaBuilderResult,
            this.projectUnit,
            this.options,
            context,
          ).run();
          functionIR.blocks = optimizerResult.blocks;
        }

        new SSAEliminator(
          functionIR,
          moduleIR,
          ssaBuilderResult.phis,
        ).eliminate();

        if (this.options.enableLateOptimizer) {
          const lateOptimizerResult = new LateOptimizer(
            functionIR,
            this.projectUnit,
            this.options,
          ).run();
          functionIR.blocks = lateOptimizerResult.blocks;
        }
      }
    }

    return this.projectUnit;
  }
}
