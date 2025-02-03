import { BlockId } from "../../ir";
/** Computes the set of dominators for each block in the CFG.
 *
 * @param predecessors - A map of block IDs to their predecessor block IDs.
 * @param entryId - The ID of the entry (root) block.
 *
 * @returns A map from block ID to the set of block IDs that dominate it.
 */
export declare function getDominators(predecessors: Map<BlockId, Set<BlockId>>, entryId: BlockId): Map<BlockId, Set<BlockId>>;
