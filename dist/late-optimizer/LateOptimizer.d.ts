import { Environment } from "../compiler";
import { BasicBlock, BlockId } from "../ir";
import { PluginOptions } from "../schemas/plugin-options";
interface LateOptimizerResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class LateOptimizer {
    private readonly options;
    private readonly environment;
    private blocks;
    private postOrder;
    constructor(options: PluginOptions, environment: Environment, blocks: Map<BlockId, BasicBlock>, postOrder: Array<BlockId>);
    optimize(): LateOptimizerResult;
}
export {};
