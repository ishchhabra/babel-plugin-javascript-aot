function getSuccessors(predecessors) {
    const successors = new Map();
    for (const [blockId] of predecessors) {
        successors.set(blockId, new Set());
    }
    for (const [blockId, preds] of predecessors) {
        for (const p of preds) {
            successors.get(p)?.add(blockId);
        }
    }
    return successors;
}

export { getSuccessors };
//# sourceMappingURL=getSuccessors.js.map
