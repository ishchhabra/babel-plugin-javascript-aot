import { BlockId } from "../../ir";
/**
 * Computes the dominance frontier for each block in the CFG.
 * The dominance frontier of a node n is the set of nodes where n's dominance ends.
 *
 * @param predecessors - Map of block IDs to their predecessor block IDs
 * @param iDom - Map of block IDs to their immediate dominator's ID
 * @returns Map of block IDs to their dominance frontier (set of block IDs)
 */
export declare function getDominanceFrontier(predecessors: Map<BlockId, Set<BlockId>>, iDom: Map<BlockId, BlockId | undefined>): Map<BlockId, Set<BlockId>>;
