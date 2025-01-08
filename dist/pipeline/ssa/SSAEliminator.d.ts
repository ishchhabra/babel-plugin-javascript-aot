import { Environment } from "../../environment";
import { BasicBlock, BlockId } from "../../frontend/ir";
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
    private readonly dominators;
    private readonly phis;
    constructor(environment: Environment, blocks: Map<BlockId, BasicBlock>, dominators: Map<BlockId, Set<BlockId>>, phis: Set<Phi>);
    eliminate(): SSAEliminationResult;
}
export {};
