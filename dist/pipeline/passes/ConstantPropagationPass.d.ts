import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { IdentifierId, TPrimitiveValue } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { BaseOptimizationPass } from "../late-optimizer/OptimizationPass";
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
export declare class ConstantPropagationPass extends BaseOptimizationPass {
    protected readonly functionIR: FunctionIR;
    private readonly moduleUnit;
    private readonly projectUnit;
    private readonly ssa;
    private readonly context;
    private readonly constants;
    constructor(functionIR: FunctionIR, moduleUnit: ModuleIR, projectUnit: ProjectUnit, ssa: SSA, context: Map<string, Map<string, Map<IdentifierId, TPrimitiveValue>>>);
    step(): {
        changed: boolean;
    };
    private evaluatePhi;
    private propagateConstantsInBlock;
    private propagateConstantsInBranchTerminal;
    private degradeSingleOperandPhi;
    /**
     * Evaluates the instruction and returns the new instruction if the instruction
     * was changed, null if the constant map was updated but the instruction remains unchanged,
     * or undefined if no changes were made at all.
     *
     * @returns The new instruction if the instruction was changed, null if partial propagation occurred,
     *          or undefined if no changes were made.
     */
    private evaluateInstruction;
    private evaluateLiteralInstruction;
    private evaluateBinaryExpressionInstruction;
    private evaluateUnaryExpressionInstruction;
    private evaluateStoreLocalInstruction;
    private evaluateLoadLocalInstruction;
    private evaluateLoadPhiInstruction;
    private evaluateExportSpecifierInstruction;
    private evaluateExportDefaultDeclarationInstruction;
    private evaluateExportNamedDeclarationInstruction;
    private evaluateLoadGlobalInstruction;
}
