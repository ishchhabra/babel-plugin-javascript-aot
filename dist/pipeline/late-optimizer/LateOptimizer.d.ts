import { CompilerOptions } from "../../compile";
import { Environment } from "../../environment";
import { BasicBlock, BlockId } from "../../frontend/ir";
interface LateOptimizerResult {
    blocks: Map<BlockId, BasicBlock>;
}
export declare class LateOptimizer {
    private readonly options;
    private readonly environment;
    private blocks;
    private postOrder;
    constructor(options: CompilerOptions, environment: Environment, blocks: Map<BlockId, BasicBlock>, postOrder: Array<BlockId>);
    optimize(): LateOptimizerResult;
}
export {};
