import { CompilerOptions } from "../compile";
import { BasicBlock, BlockId } from "../frontend/ir";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { ConstantPropagationPass } from "./passes/ConstantPropagationPass";
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

      if (this.options.enableConstantPropagationPass) {
        const constantPropagationResult = new ConstantPropagationPass(
          moduleUnit,
          this.projectUnit,
          context,
        ).run();
        moduleUnit.blocks = constantPropagationResult.blocks;
      }
    }

    return this.projectUnit;
  }
}
