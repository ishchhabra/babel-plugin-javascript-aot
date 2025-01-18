import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, IdentifierId, TPrimitiveValue } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { SSA } from "../ssa/SSABuilder";
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
    private readonly functionIR;
    private readonly moduleUnit;
    private readonly projectUnit;
    private readonly ssa;
    private readonly context;
    private readonly constants;
    constructor(functionIR: FunctionIR, moduleUnit: ModuleIR, projectUnit: ProjectUnit, ssa: SSA, context: Map<string, Map<string, Map<IdentifierId, TPrimitiveValue>>>);
    run(): {
        blocks: Map<import("../../ir").BlockId, BasicBlock>;
    };
    private propagateConstantsInBlock;
    private propagateConstantsInBranchTerminal;
    private degradeSingleOperandPhi;
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
