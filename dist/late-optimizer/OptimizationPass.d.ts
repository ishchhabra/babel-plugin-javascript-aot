import { Environment } from "../compiler";
import { BasicBlock, BlockId } from "../ir";
export interface OptimizationResult {
    changed: boolean;
}
export declare abstract class BaseOptimizationPass {
    protected readonly environment: Environment;
    protected blocks: Map<BlockId, BasicBlock>;
    protected postOrder: Array<BlockId>;
    constructor(environment: Environment, blocks: Map<BlockId, BasicBlock>, postOrder: Array<BlockId>);
    run(): {
        blocks: Map<BlockId, BasicBlock>;
    };
    protected abstract step(): OptimizationResult;
}