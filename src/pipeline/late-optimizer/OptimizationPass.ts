import { ModuleUnit } from "../../frontend/ModuleBuilder";

export interface OptimizationResult {
  changed: boolean;
}

export abstract class BaseOptimizationPass {
  constructor(protected readonly moduleUnit: ModuleUnit) {}

  public run() {
    let continueOptimizing = true;

    while (continueOptimizing) {
      const result = this.step();
      if (!result.changed) {
        continueOptimizing = false;
      }
    }

    return { blocks: this.moduleUnit.blocks };
  }

  protected abstract step(): OptimizationResult;
}
