import { BlockId } from "../../ir";
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
