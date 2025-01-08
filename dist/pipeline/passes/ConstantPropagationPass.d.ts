import { BasicBlock, BlockId, IdentifierId } from "../../frontend/ir";
import { TPrimitiveValue } from "../../frontend/ir/Instruction";
/**
 * A pass that propagates constant values through the program by evaluating expressions
 * with known constant operands at compile time. For example:
 *
 * ```js
 * const a = 5;
 * const b = 3;
 * const c = a + b;    // This will be optimized
 * ```
 *
 * Will be transformed into:
 *
 * ```js
 * const a = 5;
 * const b = 3;
 * const c = 8;        // Computed at compile time!
 * ```
 */
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
    private evaluateUnaryExpressionInstruction;
}
