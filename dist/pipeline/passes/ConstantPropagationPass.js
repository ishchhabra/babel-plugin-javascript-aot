import { createRequire } from 'module';
import { LoadGlobalInstruction } from '../../ir/instructions/memory/LoadGlobal.js';
import { LoadLocalInstruction } from '../../ir/instructions/memory/LoadLocal.js';
import { StoreLocalInstruction } from '../../ir/instructions/memory/StoreLocal.js';
import { ExportNamedDeclarationInstruction } from '../../ir/instructions/module/ExportNamedDeclaration.js';
import { ExportSpecifierInstruction } from '../../ir/instructions/module/ExportSpecifier.js';
import { BinaryExpressionInstruction } from '../../ir/instructions/value/BinaryExpression.js';
import { LiteralInstruction } from '../../ir/instructions/value/Literal.js';
import { UnaryExpressionInstruction } from '../../ir/instructions/value/UnaryExpression.js';
import 'lodash-es';

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
class ConstantPropagationPass {
    functionIR;
    moduleUnit;
    projectUnit;
    context;
    constants;
    constructor(functionIR, moduleUnit, projectUnit, context) {
        this.functionIR = functionIR;
        this.moduleUnit = moduleUnit;
        this.projectUnit = projectUnit;
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
    run() {
        for (const block of this.functionIR.blocks.values()) {
            this.propagateConstantsInBlock(block);
        }
        return { blocks: this.functionIR.blocks };
    }
    propagateConstantsInBlock(block) {
        for (const [index, instruction] of block.instructions.entries()) {
            const result = this.evaluateInstruction(instruction);
            if (result !== undefined) {
                block.instructions[index] = result;
            }
        }
    }
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
        else if (instruction instanceof LoadGlobalInstruction) {
            return this.evaluateLoadGlobalInstruction(instruction);
        }
        else if (instruction instanceof StoreLocalInstruction) {
            return this.evaluateStoreLocalInstruction(instruction);
        }
        else if (instruction instanceof LoadLocalInstruction) {
            return this.evaluateLoadLocalInstruction(instruction);
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
        this.constants.set(instruction.place.identifier.id, instruction.value);
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
    evaluateStoreLocalInstruction(instruction) {
        if (!this.constants.has(instruction.value.identifier.id)) {
            return undefined;
        }
        const value = this.constants.get(instruction.value.identifier.id);
        this.constants.set(instruction.lval.identifier.id, value);
        return undefined;
    }
    evaluateLoadLocalInstruction(instruction) {
        if (!this.constants.has(instruction.value.identifier.id)) {
            return undefined;
        }
        const value = this.constants.get(instruction.value.identifier.id);
        this.constants.set(instruction.place.identifier.id, value);
    }
    evaluateExportSpecifierInstruction(instruction) {
        if (!this.constants.has(instruction.local.identifier.id)) {
            return undefined;
        }
        const value = this.constants.get(instruction.local.identifier.id);
        this.constants.set(instruction.place.identifier.id, value);
        return undefined;
    }
    evaluateExportNamedDeclarationInstruction(instruction) {
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
        return undefined;
    }
    evaluateLoadGlobalInstruction(instruction) {
        if (instruction.kind === "builtin") {
            return undefined;
        }
        const source = instruction.source;
        const resolvedSource = resolveModulePath(source, this.moduleUnit.path);
        const globalConstants = this.context.get("constants");
        const constantsForSource = globalConstants.get(resolvedSource);
        const moduleUnit = this.projectUnit.modules.get(resolvedSource);
        const exportInstruction = moduleUnit.exportToInstructions.get(instruction.name);
        if (exportInstruction === undefined) {
            return undefined;
        }
        if (!constantsForSource.has(exportInstruction.place.identifier.id)) {
            return undefined;
        }
        const value = constantsForSource.get(exportInstruction.place.identifier.id);
        this.constants.set(instruction.place.identifier.id, value);
        return new LiteralInstruction(instruction.id, instruction.place, instruction.nodePath, value);
    }
}
function resolveModulePath(importPath, path) {
    const require = createRequire(path);
    return require.resolve(importPath);
}

export { ConstantPropagationPass };
//# sourceMappingURL=ConstantPropagationPass.js.map
