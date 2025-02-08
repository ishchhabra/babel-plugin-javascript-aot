import { FunctionIR } from "../../ir/core/FunctionIR";
export interface OptimizationResult {
    changed: boolean;
}
export declare abstract class BaseOptimizationPass {
    protected readonly functionIR: FunctionIR;
    constructor(functionIR: FunctionIR);
    run(): {
        blocks: Map<import("../../ir").BlockId, import("../../ir").BasicBlock>;
        changed: boolean;
    };
    protected abstract step(): OptimizationResult;
}
