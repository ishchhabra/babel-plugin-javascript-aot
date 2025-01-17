import { BasicBlock, BlockId } from "./Block";
/**
 * Simulated opaque type for FunctionIR to prevent using normal numbers as ids
 * accidentally.
 */
declare const opaqueFunctionIRId: unique symbol;
export type FunctionIRId = number & {
    [opaqueFunctionIRId]: "FunctionIRId";
};
export declare function makeFunctionIRId(id: number): FunctionIRId;
export declare class FunctionIR {
    readonly id: FunctionIRId;
    blocks: Map<BlockId, BasicBlock>;
    predecessors: Map<BlockId, Set<BlockId>>;
    dominators: Map<BlockId, Set<BlockId>>;
    immediateDominators: Map<BlockId, BlockId | undefined>;
    dominanceFrontier: Map<BlockId, Set<BlockId>>;
    backEdges: Map<BlockId, Set<BlockId>>;
    get entryBlockId(): BlockId;
    constructor(id: FunctionIRId, blocks: Map<BlockId, BasicBlock>);
    recomputeCFG(): void;
}
export {};
