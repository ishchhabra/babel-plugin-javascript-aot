import isEqual from "lodash/isEqual";
import { Block, BlockId } from "../HIR/Block";

/**
 * Computes the set of dominators for each block in a CFG.
 *
 * @param blocks - A map of blocks in the CFG.
 * @param entryId - The ID of the entry (root) block.
 *
 * @returns a map from block ID to the set of all blocks that
 * dominate it (including itself).
 *
 * TODO: Use Lengauer-Tarjan algorithm for more efficient dominator computation.
 */
export function computeDominators(
  blocks: Map<BlockId, Block>,
  entryId: BlockId,
) {
  const dominators = new Map<BlockId, Set<BlockId>>();

  //   Step 1: Initialize dominators.
  for (const [blockId] of blocks) {
    // The entry block is dominated only by itself
    if (blockId === entryId) {
      dominators.set(blockId, new Set([blockId]));
    } else {
      // For other blocks, start with all blocks as potential dominators
      dominators.set(blockId, new Set(blocks.keys()));
    }
  }

  // Step 2: Iteratively refine dominators.
  let changed = true;
  while (changed) {
    changed = false;

    for (const [blockId, block] of blocks) {
      // Skip entry block - we know its dominators.
      if (blockId === entryId) continue;

      // Get predecessors of the current block
      const predecessors = [...block.predecessors];

      //   Calculate new dominator set.
      let newDominators: Set<BlockId>;
      if (predecessors.length === 0) {
        // Unreachable block - only dominates itself.
        newDominators = new Set([blockId]);
      } else {
        // Start with first predecessor's dominators
        newDominators = new Set(dominators.get(predecessors[0]!));

        // Intersect with all other predecessors
        for (let i = 1; i < predecessors.length; i++) {
          const predDoms = dominators.get(predecessors[i]!)!;
          newDominators = new Set(
            [...newDominators].filter((d) => predDoms.has(d)),
          );
        }
        // Add self to dominators
        newDominators.add(blockId);
      }

      // Update if changed
      const oldDominators = dominators.get(blockId)!;
      if (!isEqual(oldDominators, newDominators)) {
        dominators.set(blockId, newDominators);
        changed = true;
      }
    }
  }

  return dominators;
}

/**
 * Computes the immediate dominator for each block from the full dominator sets.
 *
 * The immediate dominator of a block B is the unique closest dominator D that
 * strictly dominates B (D ≠ B). In other words, D dominates B and there is no
 * other dominator of B that is dominated by D (except D itself).
 *
 * For the entry block or unreachable blocks, the immediate dominator is null.
 *
 * @param dominators - Map from block ID to the set of all blocks that dominate it
 *
 * @returns Map from block ID to its immediate dominator ID, or null if none exists
 */
export function getImmediateDominators(
  dominators: Map<BlockId, Set<BlockId>>,
): Map<BlockId, BlockId | null> {
  const iDom = new Map<BlockId, BlockId | null>();

  for (const [blockId, domSet] of dominators) {
    if (domSet.size === 1) {
      // Possibly the entry block (only dominated by itself)
      iDom.set(blockId, null);
      continue;
    }

    // blockId can not be its own immediate dominator
    let candidates = [...domSet].filter((x) => x !== blockId);

    if (candidates.length === 1) {
      iDom.set(blockId, candidates[0]!);
      continue;
    }

    let immediateDominator = candidates[0]!;
    let maxDomSize = dominators.get(candidates[0]!)!.size;
    for (let i = 1; i < candidates.length; i++) {
      const currentCandidate = candidates[i]!;
      const currentDomSize = dominators.get(currentCandidate)!.size;

      if (currentDomSize > maxDomSize) {
        immediateDominator = currentCandidate;
        maxDomSize = currentDomSize;
      }
    }

    iDom.set(blockId, immediateDominator);
  }

  return iDom;
}

/**
 * Computes the least common dominator of two blocks.
 *
 * The least common dominator of two blocks is the "lowest" block that
 * dominates both the blocks.
 *
 * @param b1 - The first block
 * @param b2 - The second block
 * @param iDom - The immediate dominators map
 * @returns The least common dominator of b1 and b2, or null if none exists
 */
export function getLeastCommonDominator(
  b1: BlockId,
  b2: BlockId,
  iDom: Map<BlockId, BlockId | null>,
): BlockId | null {
  // Traverse to the root from b1 and collect all ancestors
  const ancestors = new Set<BlockId>();
  let cur: BlockId | null = b1;
  while (cur != null) {
    ancestors.add(cur);
    cur = iDom.get(cur) ?? null;
  }

  // Traverse to the root from b2 and find the first common ancestor
  cur = b2;
  while (cur != null && !ancestors.has(cur)) {
    cur = iDom.get(cur) ?? null;
  }

  return cur;
}

/**
 * Computes the dominance frontier for each block in the CFG.
 * The dominance frontier of a node n is the set of nodes where n's dominance ends.
 *
 * @param blocks - Map of block IDs to their Block objects
 * @param iDom - Map of block IDs to their immediate dominator's ID
 * @returns Map of block IDs to their dominance frontier (set of block IDs)
 */
export function computeDominanceFrontier(
  blocks: Map<BlockId, Block>,
  iDom: Map<BlockId, BlockId | null>,
): Map<BlockId, Set<BlockId>> {
  const frontier = new Map<BlockId, Set<BlockId>>();

  // Initialize empty frontier sets for all blocks
  for (const blockId of blocks.keys()) {
    frontier.set(blockId, new Set());
  }

  // For each block in the CFG
  for (const [blockId, block] of blocks) {
    // Skip if block has fewer than 2 predecessors (no merge point)
    if (block.predecessors.size < 2) continue;

    // For each predecessor of the block
    for (const pred of block.predecessors) {
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
