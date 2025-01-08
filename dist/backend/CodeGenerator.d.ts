import { BasicBlock, BlockId } from "../frontend/ir";
/**
 * Generates the code from the IR.
 */
export declare class CodeGenerator {
    #private;
    private readonly blocks;
    private readonly backEdges;
    private readonly places;
    private readonly blockToStatements;
    private readonly generatedBlocks;
    constructor(blocks: Map<BlockId, BasicBlock>, backEdges: Map<BlockId, Set<BlockId>>);
    generate(): string;
}
