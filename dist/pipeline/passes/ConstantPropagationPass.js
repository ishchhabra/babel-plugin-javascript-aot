import { BranchTerminal, JumpTerminal } from '../../ir/core/Terminal.js';
import { LoadGlobalInstruction } from '../../ir/instructions/memory/LoadGlobal.js';
import { LoadLocalInstruction } from '../../ir/instructions/memory/LoadLocal.js';
import { LoadPhiInstruction } from '../../ir/instructions/memory/LoadPhi.js';
import { StoreLocalInstruction } from '../../ir/instructions/memory/StoreLocal.js';
import { ExportDefaultDeclarationInstruction } from '../../ir/instructions/module/ExportDefaultDeclaration.js';
import { ExportNamedDeclarationInstruction } from '../../ir/instructions/module/ExportNamedDeclaration.js';
import { ExportSpecifierInstruction } from '../../ir/instructions/module/ExportSpecifier.js';
import { BinaryExpressionInstruction } from '../../ir/instructions/value/BinaryExpression.js';
import 'lodash-es';
import { LiteralInstruction } from '../../ir/instructions/value/Literal.js';
import { LogicalExpressionInstruction } from '../../ir/instructions/value/LogicalExpression.js';
import { UnaryExpressionInstruction } from '../../ir/instructions/value/UnaryExpression.js';
import { BaseOptimizationPass } from '../late-optimizer/OptimizationPass.js';

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
class ConstantPropagationPass extends BaseOptimizationPass {
    functionIR;
    moduleUnit;
    projectUnit;
    ssa;
    context;
    constants;
    constructor(functionIR, moduleUnit, projectUnit, ssa, context) {
        super(functionIR);
        this.functionIR = functionIR;
        this.moduleUnit = moduleUnit;
        this.projectUnit = projectUnit;
        this.ssa = ssa;
        this.context = context;
        let globalConstants = this.context.get("constants");
        if (globalConstants === undefined) {
            globalConstants = new Map();
            this.context.set("constants", globalConstants);
        }
        let constants = globalConstants.get(this.moduleUnit.path);
        if (constants === undefined) {
            constants = new Map();
            globalConstants.set(this.moduleUnit.path, constants);
        }
        this.constants = constants;
    }
    step() {
        let changed = false;
        for (const phi of this.ssa.phis) {
            this.evaluatePhi(phi);
        }
        for (const block of this.functionIR.blocks.values()) {
            changed ||= this.propagateConstantsInBlock(block);
        }
        return { changed };
    }
    evaluatePhi(phi) {
        let value = undefined;
        for (const [, operand] of phi.operands) {
            if (!this.constants.has(operand.identifier.id)) {
                return undefined;
            }
            const operandValue = this.constants.get(operand.identifier.id);
            if (value === undefined) {
                value = operandValue;
                continue;
            }
            if (operandValue !== value) {
                return undefined;
            }
        }
        this.constants.set(phi.place.identifier.id, value);
    }
    propagateConstantsInBlock(block) {
        let changed = false;
        for (const [index, instruction] of block.instructions.entries()) {
            const result = this.evaluateInstruction(instruction);
            if (result === undefined) {
                continue;
            }
            if (result === null) {
                changed = true;
                continue;
            }
            block.instructions[index] = result;
            changed = true;
        }
        if (block.terminal instanceof BranchTerminal) {
            changed ||= this.propagateConstantsInBranchTerminal(block);
        }
        return changed;
    }
    propagateConstantsInBranchTerminal(block) {
        const terminal = block.terminal;
        if (!(terminal instanceof BranchTerminal)) {
            throw new Error("Terminal is not a branch terminal");
        }
        const test = this.constants.get(terminal.test.identifier.id);
        if (test === undefined) {
            return false;
        }
        const targetBlockId = test ? terminal.consequent : terminal.alternate;
        block.terminal = new JumpTerminal(terminal.id, targetBlockId);
        const deadBlockId = test ? terminal.alternate : terminal.consequent;
        for (const phi of this.ssa.phis) {
            // If the phi *lives* in the dead block => remove the entire phi
            // We do not need to remove the load phi instructions, as they are
            // never going to be visited since the block is dead.
            if (phi.blockId === deadBlockId) {
                this.ssa.phis.delete(phi);
                continue;
            }
            // If a phi operand references the dead block as a predecessor => remove that operand
            for (const [operandBlockId] of phi.operands) {
                const dominators = this.functionIR.dominators.get(operandBlockId);
                if (dominators.has(deadBlockId)) {
                    phi.operands.delete(operandBlockId);
                }
                if (phi.operands.size === 1) {
                    this.degradeSingleOperandPhi(phi);
                }
            }
        }
        return true;
    }
    degradeSingleOperandPhi(phi) {
        const [[, singleOperandPlace]] = phi.operands.entries();
        const phiBlock = this.functionIR.blocks.get(phi.blockId);
        if (phiBlock === undefined) {
            throw new Error(`Block ${phi.blockId} not found`);
        }
        phiBlock.instructions = phiBlock.instructions.map((instr) => {
            if (instr instanceof LoadPhiInstruction &&
                phi.place.id === instr.value.id) {
                return new LoadLocalInstruction(instr.id, instr.place, instr.nodePath, singleOperandPlace);
            }
            return instr;
        });
    }
    /**
     * Evaluates the instruction and returns the new instruction if the instruction
     * was changed, null if the constant map was updated but the instruction remains unchanged,
     * or undefined if no changes were made at all.
     *
     * @returns The new instruction if the instruction was changed, null if partial propagation occurred,
     *          or undefined if no changes were made.
     */
    evaluateInstruction(instruction) {
        if (instruction instanceof LiteralInstruction) {
            return this.evaluateLiteralInstruction(instruction);
        }
        else if (instruction instanceof BinaryExpressionInstruction) {
            return this.evaluateBinaryExpressionInstruction(instruction);
        }
        else if (instruction instanceof UnaryExpressionInstruction) {
            return this.evaluateUnaryExpressionInstruction(instruction);
        }
        else if (instruction instanceof LogicalExpressionInstruction) {
            return this.evaluateLogicalExpressionInstruction(instruction);
        }
        else if (instruction instanceof LoadGlobalInstruction) {
            return this.evaluateLoadGlobalInstruction(instruction);
        }
        else if (instruction instanceof StoreLocalInstruction) {
            return this.evaluateStoreLocalInstruction(instruction);
        }
        else if (instruction instanceof LoadLocalInstruction) {
            return this.evaluateLoadLocalInstruction(instruction);
        }
        else if (instruction instanceof LoadPhiInstruction) {
            return this.evaluateLoadPhiInstruction(instruction);
        }
        else if (instruction instanceof ExportDefaultDeclarationInstruction) {
            return this.evaluateExportDefaultDeclarationInstruction(instruction);
        }
        else if (instruction instanceof ExportSpecifierInstruction) {
            return this.evaluateExportSpecifierInstruction(instruction);
        }
        else if (instruction instanceof ExportNamedDeclarationInstruction) {
            return this.evaluateExportNamedDeclarationInstruction(instruction);
        }
        return undefined;
    }
    evaluateLiteralInstruction(instruction) {
        if (this.constants.has(instruction.place.identifier.id)) {
            return undefined;
        }
        if (instruction.value === undefined) {
            throw new Error("Literal value is undefined");
        }
        this.constants.set(instruction.place.identifier.id, instruction.value);
        return null;
    }
    evaluateBinaryExpressionInstruction(instruction) {
        const left = this.constants.get(instruction.left.identifier.id);
        const right = this.constants.get(instruction.right.identifier.id);
        if (left === undefined || right === undefined) {
            return undefined;
        }
        let result;
        switch (instruction.operator) {
            case "+":
                result = left + right;
                break;
            case "-":
                result = left - right;
                break;
            case "*":
                result = left * right;
                break;
            case "/":
                result = left / right;
                break;
            case "|":
                result = left | right;
                break;
            case "&":
                result = left & right;
                break;
            case "^":
                result = left ^ right;
                break;
            case ">>":
                result = left >> right;
                break;
            case ">>>":
                result = left >>> right;
                break;
            case "==":
                result = left === right;
                break;
            case "!=":
                result = left !== right;
                break;
            case ">":
                result = left > right;
                break;
            case ">=":
                result = left >= right;
                break;
            case "<":
                result = left < right;
                break;
            case "<=":
                result = left <= right;
                break;
            case "!==":
                result = left !== right;
                break;
            case "===":
                result = left === right;
                break;
            case "%":
                result = left % right;
                break;
            case "**":
                result = left ** right;
                break;
            case "<<":
                result = left << right;
                break;
            default:
                return undefined;
        }
        this.constants.set(instruction.place.identifier.id, result);
        return new LiteralInstruction(instruction.id, instruction.place, instruction.nodePath, result);
    }
    evaluateUnaryExpressionInstruction(instruction) {
        const operand = this.constants.get(instruction.argument.identifier.id);
        if (operand === undefined) {
            return undefined;
        }
        let result;
        switch (instruction.operator) {
            case "!":
                result = !operand;
                break;
            case "-":
                result = -operand;
                break;
            case "~":
                result = ~operand;
                break;
            case "+":
                result = +operand;
                break;
            default:
                return undefined;
        }
        this.constants.set(instruction.place.identifier.id, result);
        return new LiteralInstruction(instruction.id, instruction.place, instruction.nodePath, result);
    }
    evaluateLogicalExpressionInstruction(instruction) {
        const left = this.constants.get(instruction.left.identifier.id);
        const right = this.constants.get(instruction.right.identifier.id);
        if (left === undefined || right === undefined) {
            return undefined;
        }
        let result;
        switch (instruction.operator) {
            case "&&":
                result = left && right;
                break;
            case "||":
                result = left || right;
                break;
            case "??":
                result = left ?? right;
                break;
            default:
                return undefined;
        }
        this.constants.set(instruction.place.identifier.id, result);
        return new LiteralInstruction(instruction.id, instruction.place, instruction.nodePath, result);
    }
    evaluateStoreLocalInstruction(instruction) {
        if (this.constants.has(instruction.lval.identifier.id)) {
            return undefined;
        }
        if (!this.constants.has(instruction.value.identifier.id)) {
            return undefined;
        }
        const value = this.constants.get(instruction.value.identifier.id);
        this.constants.set(instruction.lval.identifier.id, value);
        return null;
    }
    evaluateLoadLocalInstruction(instruction) {
        if (!this.constants.has(instruction.value.identifier.id)) {
            return undefined;
        }
        const value = this.constants.get(instruction.value.identifier.id);
        this.constants.set(instruction.place.identifier.id, value);
    }
    evaluateLoadPhiInstruction(instruction) {
        if (!this.constants.has(instruction.value.identifier.id)) {
            return undefined;
        }
        const value = this.constants.get(instruction.value.identifier.id);
        if (value === undefined) {
            throw new Error("Literal value is undefined");
        }
        this.constants.set(instruction.place.identifier.id, value);
        return new LiteralInstruction(instruction.id, instruction.place, instruction.nodePath, value);
    }
    evaluateExportSpecifierInstruction(instruction) {
        if (this.constants.has(instruction.place.identifier.id)) {
            return undefined;
        }
        const moduleExport = this.moduleUnit.exports.get(instruction.exported);
        if (moduleExport === undefined) {
            return undefined;
        }
        const identifierId = moduleExport.declaration.place.identifier.id;
        if (!this.constants.has(identifierId)) {
            return undefined;
        }
        const value = this.constants.get(identifierId);
        this.constants.set(instruction.place.identifier.id, value);
        return null;
    }
    evaluateExportDefaultDeclarationInstruction(instruction) {
        if (this.constants.has(instruction.place.identifier.id)) {
            return undefined;
        }
        if (!this.constants.has(instruction.declaration.identifier.id)) {
            return undefined;
        }
        const value = this.constants.get(instruction.declaration.identifier.id);
        this.constants.set(instruction.place.identifier.id, value);
        return null;
    }
    evaluateExportNamedDeclarationInstruction(instruction) {
        if (this.constants.has(instruction.place.identifier.id)) {
            return undefined;
        }
        const declaration = instruction.declaration;
        // For specifiers, they are already evaluated by handling the export specifier instruction.
        if (declaration === undefined) {
            return undefined;
        }
        if (!this.constants.has(declaration.identifier.id)) {
            return undefined;
        }
        const value = this.constants.get(declaration.identifier.id);
        this.constants.set(instruction.place.identifier.id, value);
        return null;
    }
    evaluateLoadGlobalInstruction(instruction) {
        const global = this.moduleUnit.globals.get(instruction.name);
        if (global === undefined || global.kind === "builtin") {
            return undefined;
        }
        const source = global.source;
        const globalConstants = this.context.get("constants");
        const constantsForSource = globalConstants.get(source);
        const moduleUnit = this.projectUnit.modules.get(source);
        const moduleExport = moduleUnit.exports.get(global.name);
        if (moduleExport === undefined) {
            return undefined;
        }
        const identifierId = moduleExport.declaration.place.identifier.id;
        if (!constantsForSource.has(identifierId)) {
            return undefined;
        }
        const value = constantsForSource.get(identifierId);
        this.constants.set(instruction.place.identifier.id, value);
        return new LiteralInstruction(instruction.id, instruction.place, instruction.nodePath, value);
    }
}

export { ConstantPropagationPass };
//# sourceMappingURL=ConstantPropagationPass.js.map
