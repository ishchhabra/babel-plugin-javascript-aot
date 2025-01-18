import { CompilerOptions } from "../../compile";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { ConstantPropagationPass } from "../passes/ConstantPropagationPass";
import { SSA } from "../ssa/SSABuilder";

interface OptimizerResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class Optimizer {
  constructor(
    private readonly functionIR: FunctionIR,
    private readonly moduleIR: ModuleIR,
    private readonly ssa: SSA,
    private readonly projectUnit: ProjectUnit,
    private readonly options: CompilerOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly context: Map<string, any>,
  ) {}

  public run(): OptimizerResult {
    let blocks = this.functionIR.blocks;
    if (this.options.enableConstantPropagationPass) {
      const constantPropagationResult = new ConstantPropagationPass(
        this.functionIR,
        this.moduleIR,
        this.projectUnit,
        this.ssa,
        this.context,
      ).run();
      blocks = constantPropagationResult.blocks;
    }

    return { blocks };
  }
}
