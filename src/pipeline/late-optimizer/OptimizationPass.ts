import { FunctionIR } from "../../ir/core/FunctionIR";

export interface OptimizationResult {
  changed: boolean;
}

export abstract class BaseOptimizationPass {
  constructor(protected readonly functionIR: FunctionIR) {}

  public run() {
    let changed = false;
    let result: OptimizationResult;
    while ((result = this.step()).changed) {
      changed ||= result.changed;
    }

    return { blocks: this.functionIR.blocks, changed };
  }

  protected abstract step(): OptimizationResult;
}
