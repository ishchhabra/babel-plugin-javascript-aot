import { BasicBlock, IdentifierId } from "../../frontend/ir";
import { TPrimitiveValue } from "../../frontend/ir/Instruction";
import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
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
    private readonly moduleUnit;
    private readonly projectUnit;
    private readonly context;
    private readonly constants;
    constructor(moduleUnit: ModuleUnit, projectUnit: ProjectUnit, context: Map<string, Map<string, Map<IdentifierId, TPrimitiveValue>>>);
    run(): {
        blocks: Map<import("../../frontend/ir").BlockId, BasicBlock>;
    };
    private propagateConstantsInBlock;
    private evaluateInstruction;
    private evaluateLiteralInstruction;
    private evaluateBinaryExpressionInstruction;
    private evaluateUnaryExpressionInstruction;
    private evaluateStoreLocalInstruction;
    private evaluateLoadLocalInstruction;
    private evaluateExportSpecifierInstruction;
    private evaluateExportNamedDeclarationInstruction;
    private evaluateLoadGlobalInstruction;
}
