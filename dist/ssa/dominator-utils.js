import isEqual from "lodash/isEqual";
/** Computes the set of dominators for each block in the CFG.
 *
 * @param predecessors - A map of block IDs to their predecessor block IDs.
 * @param entryId - The ID of the entry (root) block.
 *
 * @returns A map from block ID to the set of block IDs that dominate it.
 */
export function getDominators(predecessors, entryId) {
    const dominators = new Map();
    // Step 1: Initialize dominators.
    for (const blockId of predecessors.keys()) {
        // The entry block is dominated only by itself.
        if (blockId === entryId) {
            dominators.set(blockId, new Set([blockId]));
        }
        else {
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
            let newDominators;
            if (preds.size === 0) {
                // Unreachable block - only dominated by itself.
                newDominators = new Set([blockId]);
            }
            else {
                // Start with first predecessor's dominators.
                const firstPred = [...preds][0];
                newDominators = new Set(dominators.get(firstPred));
                // Intersect with dominators of other predecessors.
                for (const predecessor of [...preds].slice(1)) {
                    const predecessorDominators = dominators.get(predecessor);
                    newDominators = new Set([...newDominators].filter((dominator) => predecessorDominators.has(dominator)));
                }
                // Add self to the dominators.
                newDominators.add(blockId);
            }
            // Update dominators if changed.
            const oldDominators = dominators.get(blockId);
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
 * For the entry block or unreachable blocks, the immediate dominator is undefined.
 *
 * @param dominators - Map from block ID to the set of all blocks that dominate it
 *
 * @returns Map from block ID to its immediate dominator ID, or undefined if none exists
 */
export function getImmediateDominators(dominators) {
    const iDom = new Map();
    for (const [blockId, domSet] of dominators) {
        if (domSet.size === 1) {
            // Possibly the entry block (only dominated by itself)
            iDom.set(blockId, undefined);
            continue;
        }
        // blockId can not be its own immediate dominator
        let candidates = [...domSet].filter((x) => x !== blockId);
        if (candidates.length === 1) {
            iDom.set(blockId, candidates[0]);
            continue;
        }
        let immediateDominator = candidates[0];
        let maxDomSize = dominators.get(candidates[0]).size;
        for (let i = 1; i < candidates.length; i++) {
            const currentCandidate = candidates[i];
            const currentDomSize = dominators.get(currentCandidate).size;
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
 * Computes the dominance frontier for each block in the CFG.
 * The dominance frontier of a node n is the set of nodes where n's dominance ends.
 *
 * @param predecessors - Map of block IDs to their predecessor block IDs
 * @param iDom - Map of block IDs to their immediate dominator's ID
 * @returns Map of block IDs to their dominance frontier (set of block IDs)
 */
export function getDominanceFrontier(predecessors, iDom) {
    const frontier = new Map();
    // Initialize empty frontier sets for all blocks
    for (const blockId of predecessors.keys()) {
        frontier.set(blockId, new Set());
    }
    // For each block in the CFG
    for (const [blockId, preds] of predecessors) {
        // Skip if block has fewer than 2 predecessors (no merge point)
        if (preds.size < 2)
            continue;
        // For each predecessor of the block
        for (const pred of preds) {
            let runner = pred;
            // Walk up the dominator tree until we hit the immediate dominator of the current block
            while (runner !== iDom.get(blockId)) {
                // Add the current block to the frontier of the runner
                frontier.get(runner)?.add(blockId);
                // Move up the dominator tree
                const nextRunner = iDom.get(runner);
                if (!nextRunner)
                    break; // Safety check for the entry block
                runner = nextRunner;
            }
        }
    }
    return frontier;
}
//# sourceMappingURL=dominator-utils.js.map