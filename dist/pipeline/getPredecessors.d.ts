import { BasicBlock, BlockId } from "../frontend/ir";
export declare function getPredecessors(blocks: Map<BlockId, BasicBlock>): Map<BlockId, Set<BlockId>>;
