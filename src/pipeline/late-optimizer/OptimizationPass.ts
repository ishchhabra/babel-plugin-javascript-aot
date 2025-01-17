import { FunctionIR } from "../../ir/core/FunctionIR";

export interface OptimizationResult {
  changed: boolean;
}

export abstract class BaseOptimizationPass {
  constructor(protected readonly functionIR: FunctionIR) {}

  public run() {
    let continueOptimizing = true;

    while (continueOptimizing) {
      const result = this.step();
      if (!result.changed) {
        continueOptimizing = false;
      }
    }

    return { blocks: this.functionIR.blocks };
  }

  protected abstract step(): OptimizationResult;
}
