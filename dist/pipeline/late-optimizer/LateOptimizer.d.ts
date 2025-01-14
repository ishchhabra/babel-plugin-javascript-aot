import { CompilerOptions } from "../../compile";
import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../../ir";
interface LateOptimizerResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class LateOptimizer {
    private readonly moduleUnit;
    private readonly projectUnit;
    private readonly options;
    constructor(moduleUnit: ModuleUnit, projectUnit: ProjectUnit, options: CompilerOptions);
    run(): LateOptimizerResult;
}
export {};
