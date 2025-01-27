import { BaseInstruction } from "../base";
import { BasicBlock, BlockId } from "./Block";
import { Place } from "./Place";
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
    /**
     * A list of instructions executed at the very start of the function. These
     * typically handle parameter initialization such as default values,
     * destructuring, rest/spread setup, etc. Essentially, these instructions
     * ensure the function's parameter `Place`s are fully populated before
     * they are referenced.
     */
    readonly header: BaseInstruction[];
    readonly params: Place[];
    blocks: Map<BlockId, BasicBlock>;
    predecessors: Map<BlockId, Set<BlockId>>;
    successors: Map<BlockId, Set<BlockId>>;
    dominators: Map<BlockId, Set<BlockId>>;
    immediateDominators: Map<BlockId, BlockId | undefined>;
    dominanceFrontier: Map<BlockId, Set<BlockId>>;
    backEdges: Map<BlockId, Set<BlockId>>;
    get entryBlock(): BasicBlock;
    get entryBlockId(): BlockId;
    constructor(id: FunctionIRId, 
    /**
     * A list of instructions executed at the very start of the function. These
     * typically handle parameter initialization such as default values,
     * destructuring, rest/spread setup, etc. Essentially, these instructions
     * ensure the function's parameter `Place`s are fully populated before
     * they are referenced.
     */
    header: BaseInstruction[], params: Place[], blocks: Map<BlockId, BasicBlock>);
    private computeCFG;
    recomputeCFG(): void;
}
export {};
