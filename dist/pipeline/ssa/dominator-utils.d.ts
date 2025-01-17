import { BlockId } from "../../ir";
/** Computes the set of dominators for each block in the CFG.
 *
 * @param predecessors - A map of block IDs to their predecessor block IDs.
 * @param entryId - The ID of the entry (root) block.
 *
 * @returns A map from block ID to the set of block IDs that dominate it.
 */
export declare function getDominators(predecessors: Map<BlockId, Set<BlockId>>, entryId: BlockId): Map<BlockId, Set<BlockId>>;
/**
 * Computes the immediate dominator for each block from the full dominator sets.
 *
 * The immediate dominator of a block B is the unique closest dominator D that
 * strictly dominates B (D ≠ B). In other words, D dominates B and there is no
 * other dominator of B that is dominated by D (except D itself).
 *
 * For the entry block or unreachable blocks, the immediate dominator is undefined.
 *
 * @param dominators - Map from block ID to the set of all blocks that dominate it
 *
 * @returns Map from block ID to its immediate dominator ID, or undefined if none exists
 */
export declare function getImmediateDominators(dominators: Map<BlockId, Set<BlockId>>): Map<BlockId, BlockId | undefined>;
/**
 * Computes the dominance frontier for each block in the CFG.
 * The dominance frontier of a node n is the set of nodes where n's dominance ends.
 *
 * @param predecessors - Map of block IDs to their predecessor block IDs
 * @param iDom - Map of block IDs to their immediate dominator's ID
 * @returns Map of block IDs to their dominance frontier (set of block IDs)
 */
export declare function getDominanceFrontier(predecessors: Map<BlockId, Set<BlockId>>, iDom: Map<BlockId, BlockId | undefined>): Map<BlockId, Set<BlockId>>;
