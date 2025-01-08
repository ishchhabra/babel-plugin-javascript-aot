import { BasicBlock, BlockId, IdentifierId } from "../../frontend/ir";
import { TPrimitiveValue } from "../../frontend/ir/Instruction";
export declare class ConstantPropagationPass {
    private readonly path;
    private readonly blocks;
    private readonly context;
    private readonly constants;
    constructor(path: string, blocks: Map<BlockId, BasicBlock>, context: Map<string, Map<string, Map<IdentifierId, TPrimitiveValue>>>);
    run(): {
        blocks: Map<BlockId, BasicBlock>;
    };
    private propagateConstantsInBlock;
    private evaluateInstruction;
    private evaluateLiteralInstruction;
    private evaluateBinaryExpressionInstruction;
}
