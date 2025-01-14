import { CompilerOptions } from "../../compile";
import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock } from "../../ir";
import { BlockId } from "../../ir";
interface OptimizerResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class Optimizer {
    private readonly moduleUnit;
    private readonly projectUnit;
    private readonly options;
    private readonly context;
    constructor(moduleUnit: ModuleUnit, projectUnit: ProjectUnit, options: CompilerOptions, context: Map<string, any>);
    run(): OptimizerResult;
}
export {};
