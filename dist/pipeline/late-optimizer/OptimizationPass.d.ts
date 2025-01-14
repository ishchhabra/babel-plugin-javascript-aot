import { ModuleUnit } from "../../frontend/ModuleBuilder";
export interface OptimizationResult {
    changed: boolean;
}
export declare abstract class BaseOptimizationPass {
    protected readonly moduleUnit: ModuleUnit;
    constructor(moduleUnit: ModuleUnit);
    run(): {
        blocks: Map<import("../../ir").BlockId, import("../../ir").BasicBlock>;
    };
    protected abstract step(): OptimizationResult;
}
