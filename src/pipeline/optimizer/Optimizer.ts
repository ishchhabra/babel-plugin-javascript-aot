import { CompilerOptions } from "../../compile";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { CallGraph } from "../analysis/CallGraph";
import { ConstantPropagationPass } from "../passes/ConstantPropagationPass";
import { FunctionInliningPass } from "../passes/FunctionInliningPass";
import { SSA } from "../ssa/SSABuilder";

interface OptimizerResult {
  blocks: Map<BlockId, BasicBlock>;
}

export class Optimizer {
  constructor(
    private readonly functionIR: FunctionIR,
    private readonly moduleIR: ModuleIR,
    private readonly callGraph: CallGraph,
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

    if (this.options.enableFunctionInliningPass) {
      const functionInliningResult = new FunctionInliningPass(
        this.functionIR,
        this.moduleIR,
        this.callGraph,
        this.projectUnit,
      ).run();
      blocks = functionInliningResult.blocks;
    }

    return { blocks };
  }
}
