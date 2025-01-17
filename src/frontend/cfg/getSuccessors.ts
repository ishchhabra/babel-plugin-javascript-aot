import { BlockId } from "../../ir";

export function getSuccessors(
  predecessors: Map<BlockId, Set<BlockId>>,
): Map<BlockId, Set<BlockId>> {
  const successors = new Map<BlockId, Set<BlockId>>();

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
