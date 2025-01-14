import { CompilerOptions } from "../compile";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../ir";
import { LateOptimizer } from "./late-optimizer/LateOptimizer";
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
      const moduleUnit = this.projectUnit.modules.get(moduleName)!;
      const ssaBuilderResult = new SSABuilder(moduleUnit).build();
      new SSAEliminator(moduleUnit, ssaBuilderResult.phis).eliminate();

      if (this.options.enableOptimizer) {
        const optimizerResult = new Optimizer(
          moduleUnit,
          this.projectUnit,
          this.options,
          context,
        ).run();
        moduleUnit.blocks = optimizerResult.blocks;
      }

      if (this.options.enableLateOptimizer) {
        const lateOptimizerResult = new LateOptimizer(
          moduleUnit,
          this.projectUnit,
          this.options,
        ).run();
        moduleUnit.blocks = lateOptimizerResult.blocks;
      }
    }

    return this.projectUnit;
  }
}
