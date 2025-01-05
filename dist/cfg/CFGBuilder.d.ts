import { Environment } from "../compiler/environment";
import { BasicBlock, BlockId } from "../ir";
interface CFG {
    predecessors: Map<BlockId, Set<BlockId>>;
    successors: Map<BlockId, Set<BlockId>>;
    postOrder: BlockId[];
    backEdges: Map<BlockId, Set<BlockId>>;
}
export declare class CFGBuilder {
    private readonly environment;
    private readonly blocks;
    constructor(environment: Environment, blocks: Map<BlockId, BasicBlock>);
    build(): CFG;
    private getPredecessors;
    private getSuccessors;
    private getBackEdges;
    private getPostOrder;
}
export {};
