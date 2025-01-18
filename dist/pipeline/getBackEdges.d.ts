import { BasicBlock, BlockId } from "../ir";
export declare function getBackEdges(blocks: Map<BlockId, BasicBlock>, dominators: Map<BlockId, Set<BlockId>>, predecessors: Map<BlockId, Set<BlockId>>): Map<BlockId, Set<BlockId>>;
