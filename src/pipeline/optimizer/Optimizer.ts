import { CompilerOptions } from "../../compile";
import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock } from "../../ir";

import { BlockId } from "../../ir";
import { ConstantPropagationPass } from "../passes/ConstantPropagationPass";

interface OptimizerResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class Optimizer {
  constructor(
    private readonly moduleUnit: ModuleUnit,
    private readonly projectUnit: ProjectUnit,
    private readonly options: CompilerOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly context: Map<string, any>,
  ) {}

  public run(): OptimizerResult {
    let blocks = this.moduleUnit.blocks;
    if (this.options.enableConstantPropagationPass) {
      const constantPropagationResult = new ConstantPropagationPass(
        this.moduleUnit,
        this.projectUnit,
        this.context,
      ).run();
      blocks = constantPropagationResult.blocks;
    }

    return { blocks };
  }
}
