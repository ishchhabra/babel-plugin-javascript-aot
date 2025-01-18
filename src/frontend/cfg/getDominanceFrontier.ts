import { BlockId } from "../../ir";

/**
 * Computes the dominance frontier for each block in the CFG.
 * The dominance frontier of a node n is the set of nodes where n's dominance ends.
 *
 * @param predecessors - Map of block IDs to their predecessor block IDs
 * @param iDom - Map of block IDs to their immediate dominator's ID
 * @returns Map of block IDs to their dominance frontier (set of block IDs)
 */
export function getDominanceFrontier(
  predecessors: Map<BlockId, Set<BlockId>>,
  iDom: Map<BlockId, BlockId | undefined>,
): Map<BlockId, Set<BlockId>> {
  const frontier = new Map<BlockId, Set<BlockId>>();

  // Initialize empty frontier sets for all blocks
  for (const blockId of predecessors.keys()) {
    frontier.set(blockId, new Set());
  }

  // For each block in the CFG
  for (const [blockId, preds] of predecessors) {
    // Skip if block has fewer than 2 predecessors (no merge point)
    if (preds.size < 2) continue;

    // For each predecessor of the block
    for (const pred of preds) {
      let runner = pred;

      // Walk up the dominator tree until we hit the immediate dominator of the current block
      while (runner !== iDom.get(blockId)) {
        // Add the current block to the frontier of the runner
        frontier.get(runner)?.add(blockId);

        // Move up the dominator tree
        const nextRunner = iDom.get(runner);
        if (!nextRunner) break; // Safety check for the entry block
        runner = nextRunner;
      }
    }
  }

  return frontier;
}
