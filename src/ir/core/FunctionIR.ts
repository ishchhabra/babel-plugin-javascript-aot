import {
  getBackEdges,
  getDominanceFrontier,
  getDominators,
  getImmediateDominators,
  getPredecessors,
  getSuccessors,
} from "../../frontend/cfg";
import { BasicBlock, BlockId } from "./Block";

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
  public predecessors!: Map<BlockId, Set<BlockId>>;
  public successors!: Map<BlockId, Set<BlockId>>;
  public dominators!: Map<BlockId, Set<BlockId>>;
  public immediateDominators!: Map<BlockId, BlockId | undefined>;
  public dominanceFrontier!: Map<BlockId, Set<BlockId>>;
  public backEdges!: Map<BlockId, Set<BlockId>>;

  get entryBlockId(): BlockId {
    return this.blocks.keys().next().value!;
  }

  constructor(
    public readonly id: FunctionIRId,
    public blocks: Map<BlockId, BasicBlock>,
  ) {
    this.computeCFG();
  }

  private computeCFG() {
    this.predecessors = getPredecessors(this.blocks);
    this.successors = getSuccessors(this.predecessors);
    this.dominators = getDominators(this.predecessors, this.entryBlockId);
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

  public recomputeCFG() {
    this.computeCFG();
  }
}
