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
function getImmediateDominators(dominators) {
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

export { getImmediateDominators };
//# sourceMappingURL=getImmediateDominators.js.map
