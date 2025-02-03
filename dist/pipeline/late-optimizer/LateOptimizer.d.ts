import { CompilerOptions } from "../../compile";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
interface LateOptimizerResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class LateOptimizer {
    private readonly functionIR;
    private readonly projectUnit;
    private readonly options;
    constructor(functionIR: FunctionIR, projectUnit: ProjectUnit, options: CompilerOptions);
    run(): LateOptimizerResult;
}
export {};
