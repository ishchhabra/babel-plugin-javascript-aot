import { CompilerOptions } from "../compile";
import { Environment } from "../environment";
import { BasicBlock, BlockId } from "../frontend/ir";
export interface PipelineResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class Pipeline {
    private readonly options;
    constructor(options: CompilerOptions);
    run(path: string, blocks: Map<BlockId, BasicBlock>, predecessors: Map<BlockId, Set<BlockId>>, dominators: Map<BlockId, Set<BlockId>>, dominanceFrontier: Map<BlockId, Set<BlockId>>, environment: Environment): {
        blocks: Map<BlockId, BasicBlock>;
    };
}
