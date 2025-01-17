import { BasicBlock, BlockId } from "../ir";
export declare function getPredecessors(blocks: Map<BlockId, BasicBlock>): Map<BlockId, Set<BlockId>>;
