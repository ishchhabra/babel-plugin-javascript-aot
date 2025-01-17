import { CompilerOptions } from "../../compile";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
interface OptimizerResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class Optimizer {
    private readonly functionIR;
    private readonly moduleIR;
    private readonly projectUnit;
    private readonly options;
    private readonly context;
    constructor(functionIR: FunctionIR, moduleIR: ModuleIR, projectUnit: ProjectUnit, options: CompilerOptions, context: Map<string, any>);
    run(): OptimizerResult;
}
export {};
