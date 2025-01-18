import { isEqual } from "lodash-es";
import { BlockId } from "../../ir";

/** Computes the set of dominators for each block in the CFG.
 *
 * @param predecessors - A map of block IDs to their predecessor block IDs.
 * @param entryId - The ID of the entry (root) block.
 *
 * @returns A map from block ID to the set of block IDs that dominate it.
 */
export function getDominators(
  predecessors: Map<BlockId, Set<BlockId>>,
  entryId: BlockId,
): Map<BlockId, Set<BlockId>> {
  const dominators = new Map<BlockId, Set<BlockId>>();

  // Step 1: Initialize dominators.
  for (const blockId of predecessors.keys()) {
    // The entry block is dominated only by itself.
    if (blockId === entryId) {
      dominators.set(blockId, new Set([blockId]));
    } else {
      // For other blocks, start with all blocks as potential dominators.
      dominators.set(blockId, new Set(predecessors.keys()));
    }
  }

  // Step 2: Iteratively refine dominators.
  let changed = true;
  while (changed) {
    changed = false;

    for (const [blockId, preds] of predecessors) {
      // Skip entry block - we know its dominators.
      if (blockId === entryId) {
        continue;
      }

      // Calculate new dominator set.
      let newDominators: Set<BlockId>;
      if (preds.size === 0) {
        // Unreachable block - only dominated by itself.
        newDominators = new Set([blockId]);
      } else {
        // Start with first predecessor's dominators.
        const firstPred = [...preds][0]!;
        newDominators = new Set(dominators.get(firstPred)!);

        // Intersect with dominators of other predecessors.
        for (const predecessor of [...preds].slice(1)) {
          const predecessorDominators = dominators.get(predecessor)!;
          newDominators = new Set(
            [...newDominators].filter((dominator) =>
              predecessorDominators.has(dominator),
            ),
          );
        }
        // Add self to the dominators.
        newDominators.add(blockId);
      }

      // Update dominators if changed.
      const oldDominators = dominators.get(blockId)!;
      if (!isEqual(oldDominators, newDominators)) {
        dominators.set(blockId, newDominators);
        changed = true;
      }
    }
  }

  return dominators;
}
