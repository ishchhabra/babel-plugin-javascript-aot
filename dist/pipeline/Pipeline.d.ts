import { CompilerOptions } from "../compile";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BasicBlock, BlockId } from "../ir";
export interface PipelineResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class Pipeline {
    private readonly projectUnit;
    private readonly options;
    constructor(projectUnit: ProjectUnit, options: CompilerOptions);
    run(): ProjectUnit;
}
