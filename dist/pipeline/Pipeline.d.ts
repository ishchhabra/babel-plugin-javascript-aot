import { CompilerOptions } from "../compile";
import { BasicBlock, BlockId } from "../frontend/ir";
import { ProjectUnit } from "../frontend/ProjectBuilder";
export interface PipelineResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class Pipeline {
    private readonly projectUnit;
    private readonly options;
    constructor(projectUnit: ProjectUnit, options: CompilerOptions);
    run(): ProjectUnit;
}
