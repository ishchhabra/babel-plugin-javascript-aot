import { getBackEdges } from "../../pipeline/getBackEdges";
import { getPredecessors } from "../../pipeline/getPredecessors";
import {
  getDominanceFrontier,
  getDominators,
  getImmediateDominators,
} from "../../pipeline/ssa/dominator-utils";
import { BasicBlock, BlockId, makeBlockId } from "./Block";

/**
 * Simulated opaque type for FunctionIR to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueFunctionIRId = Symbol();
export type FunctionIRId = number & { [opaqueFunctionIRId]: "FunctionIRId" };

export function makeFunctionIRId(id: number): FunctionIRId {
  return id as FunctionIRId;
}

export class FunctionIR {
  public predecessors: Map<BlockId, Set<BlockId>>;
  public dominators: Map<BlockId, Set<BlockId>>;
  public immediateDominators: Map<BlockId, BlockId | undefined>;
  public dominanceFrontier: Map<BlockId, Set<BlockId>>;
  public backEdges: Map<BlockId, Set<BlockId>>;

  constructor(
    public readonly id: FunctionIRId,
    public blocks: Map<BlockId, BasicBlock>,
  ) {
    this.predecessors = getPredecessors(blocks);
    this.dominators = getDominators(this.predecessors, makeBlockId(0));
    this.immediateDominators = getImmediateDominators(this.dominators);
    this.dominanceFrontier = getDominanceFrontier(
      this.predecessors,
      this.immediateDominators,
    );
    this.backEdges = getBackEdges(blocks, this.dominators, this.predecessors);
  }

  public recomputeCFG() {
    this.predecessors = getPredecessors(this.blocks);
    this.dominators = getDominators(this.predecessors, makeBlockId(0));
    this.immediateDominators = getImmediateDominators(this.dominators);
    this.dominanceFrontier = getDominanceFrontier(
      this.predecessors,
      this.immediateDominators,
    );
    this.backEdges = getBackEdges(
      this.blocks,
      this.dominators,
      this.predecessors,
    );
  }
}
