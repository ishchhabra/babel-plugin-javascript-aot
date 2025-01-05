import { Environment } from "../compiler";
import { BasicBlock, BlockId } from "../ir";
import { Phi } from "./Phi";
interface SSAEliminationResult {
    blocks: Map<BlockId, BasicBlock>;
}
/**
 * Eliminates the phis from the HIR by inserting copy instructions.
 */
export declare class SSAEliminator {
    #private;
    private readonly environment;
    private readonly blocks;
    private readonly phis;
    constructor(environment: Environment, blocks: Map<BlockId, BasicBlock>, phis: Set<Phi>);
    eliminate(): SSAEliminationResult;
}
export {};
