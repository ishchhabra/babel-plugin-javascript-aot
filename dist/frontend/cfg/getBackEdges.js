function getBackEdges(blocks, dominators, predecessors) {
    const backEdges = new Map();
    // Initialize empty sets for all blocks
    for (const blockId of blocks.keys()) {
        backEdges.set(blockId, new Set());
    }
    for (const [blockId, preds] of predecessors.entries()) {
        const dominatedByBlock = Array.from(blocks.keys()).filter((b) => dominators.get(b)?.has(blockId));
        for (const pred of preds) {
            if (dominatedByBlock.includes(pred)) {
                // Add the predecessor to the set of back edges for this block
                backEdges.get(blockId)?.add(pred);
            }
        }
    }
    return backEdges;
}

export { getBackEdges };
//# sourceMappingURL=getBackEdges.js.map
