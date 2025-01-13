import { BasicBlock, BlockId } from "../ir";

export function getBackEdges(
  blocks: Map<BlockId, BasicBlock>,
  dominators: Map<BlockId, Set<BlockId>>,
  predecessors: Map<BlockId, Set<BlockId>>,
): Map<BlockId, Set<BlockId>> {
  const backEdges = new Map<BlockId, Set<BlockId>>();

  // Initialize empty sets for all blocks
  for (const blockId of blocks.keys()) {
    backEdges.set(blockId, new Set());
  }

  for (const [blockId, preds] of predecessors.entries()) {
    const dominatedByBlock = Array.from(blocks.keys()).filter((b) =>
      dominators.get(b)?.has(blockId),
    );

    for (const pred of preds) {
      if (dominatedByBlock.includes(pred)) {
        // Add the predecessor to the set of back edges for this block
        backEdges.get(blockId)?.add(pred);
      }
    }
  }

  return backEdges;
}
