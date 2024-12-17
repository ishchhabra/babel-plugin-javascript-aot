"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constantPropagation = constantPropagation;
const DEFAULT_OPTIONS = {
    debug: false,
    maxIterations: 1000,
};
function constantPropagation(blocks, options) {
    if (!blocks || blocks.size === 0) {
        return { iterations: 0, optimizationsApplied: 0 };
    }
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const constants = new Map();
    let iteration = 0;
    let totalOptimizations = 0;
    while (iteration < opts.maxIterations) {
        if (opts.debug) {
            console.log(`\n--- Iteration ${iteration} ---`);
        }
        const result = applyConstantPropagation(blocks, constants, opts.debug);
        if (!result.hasChanges)
            break;
        totalOptimizations += result.optimizationsApplied;
        iteration++;
    }
    if (iteration >= opts.maxIterations) {
        console.warn("Constant propagation reached maximum iterations limit");
    }
    return {
        iterations: iteration,
        optimizationsApplied: totalOptimizations,
    };
}
function applyConstantPropagation(blocks, constants, debug) {
    let hasChanges = false;
    let optimizationsApplied = 0;
    const constantCache = new Map(constants);
    for (const block of blocks.values()) {
        const blockResult = processBlock(block, constantCache, debug);
        hasChanges = hasChanges || blockResult.hasChanges;
        optimizationsApplied += blockResult.optimizationsApplied;
    }
    // Update main constants map only if changes were made
    if (hasChanges) {
        constants.clear();
        constantCache.forEach((value, key) => constants.set(key, value));
    }
    return { hasChanges, optimizationsApplied };
}
function processBlock(block, constantCache, debug) {
    let hasChanges = false;
    let optimizationsApplied = 0;
    for (let i = 0; i < block.instructions.length; i++) {
        const instruction = block.instructions[i];
        if (!instruction)
            continue;
        try {
            const evaluatedValue = evaluateInstruction(constantCache, instruction);
            if (evaluatedValue !== null) {
                const targetId = instruction.target.identifier.id;
                const existingValue = constantCache.get(targetId);
                // Only count as a change if the value is different from what we had before
                const isNewValue = !existingValue ||
                    JSON.stringify(existingValue.value) !==
                        JSON.stringify(evaluatedValue.value);
                if (isNewValue) {
                    // Store the evaluated constant in the cache
                    constantCache.set(targetId, evaluatedValue);
                    // Create new instruction with the evaluated value
                    block.instructions[i] = {
                        ...instruction,
                        kind: "StoreLocal",
                        target: instruction.target,
                        value: {
                            kind: "Primitive",
                            value: evaluatedValue.value,
                        },
                    };
                    hasChanges = true;
                    optimizationsApplied++;
                    if (debug) {
                        console.log(`Optimized instruction ${instruction.id}: ${JSON.stringify(evaluatedValue)}`);
                    }
                }
            }
        }
        catch (error) {
            if (debug) {
                console.error(`Error processing instruction ${instruction.id}:`, error);
            }
        }
    }
    return { hasChanges, optimizationsApplied };
}
function evaluateInstruction(constants, instruction) {
    switch (instruction.kind) {
        case "StoreLocal":
            if (instruction.value.kind === "Primitive") {
                return { kind: "Primitive", value: instruction.value.value };
            }
            if (instruction.value.kind === "Load") {
                return readConstant(constants, instruction.value.place);
            }
            return null;
        case "UnaryExpression": {
            const operand = readConstant(constants, instruction.value);
            if (operand === null)
                return null;
            return evaluateUnaryExpression(operand, instruction.operator);
        }
        case "BinaryExpression": {
            const left = readConstant(constants, instruction.left);
            const right = readConstant(constants, instruction.right);
            if (left === null || right === null)
                return null;
            return evaluateBinaryExpression(left, right, instruction.operator);
        }
        case "UpdateExpression": {
            const operand = readConstant(constants, instruction.value);
            if (operand === null)
                return null;
            return evaluateUpdateExpression(operand, instruction.operator, instruction.prefix);
        }
        default:
            return null;
    }
}
function evaluateUnaryExpression(operand, operator) {
    switch (operator) {
        case "!":
            return { kind: "Primitive", value: !operand.value };
        case "~":
            if (typeof operand.value !== "number" &&
                typeof operand.value !== "bigint") {
                return null;
            }
            return { kind: "Primitive", value: ~operand.value };
        case "-":
            return { kind: "Primitive", value: -operand.value };
        case "+":
            return { kind: "Primitive", value: +operand.value };
    }
}
function evaluateBinaryExpression(left, right, operator) {
    if (left.value == null || right.value == null) {
        return null;
    }
    const leftValue = left.value;
    const rightValue = right.value;
    switch (operator) {
        case "+":
            if (!canAdd(leftValue, rightValue)) {
                return null;
            }
            return {
                kind: "Primitive",
                value: leftValue + rightValue,
            };
        case "-":
            if (!canArithmetic(leftValue, rightValue)) {
                return null;
            }
            return {
                kind: "Primitive",
                value: leftValue - rightValue,
            };
        case "*":
            if (!canArithmetic(leftValue, rightValue)) {
                return null;
            }
            return {
                kind: "Primitive",
                value: leftValue * rightValue,
            };
        case "/":
            if (!canArithmetic(leftValue, rightValue)) {
                return null;
            }
            return {
                kind: "Primitive",
                value: leftValue / rightValue,
            };
        case "|":
            return {
                kind: "Primitive",
                value: leftValue | rightValue,
            };
        case "&":
            return {
                kind: "Primitive",
                value: leftValue & rightValue,
            };
        case "^":
            return {
                kind: "Primitive",
                value: leftValue ^ rightValue,
            };
        case ">>":
            return {
                kind: "Primitive",
                value: leftValue >> rightValue,
            };
        case ">>>":
            return {
                kind: "Primitive",
                value: leftValue >>> rightValue,
            };
        case "==":
            return {
                kind: "Primitive",
                value: leftValue === rightValue,
            };
        case "!=":
            return {
                kind: "Primitive",
                value: leftValue !== rightValue,
            };
        case ">":
            return {
                kind: "Primitive",
                value: leftValue > rightValue,
            };
        case ">=":
            return {
                kind: "Primitive",
                value: leftValue >= rightValue,
            };
        case "<":
            return {
                kind: "Primitive",
                value: leftValue < rightValue,
            };
        case "<=":
            return {
                kind: "Primitive",
                value: leftValue <= rightValue,
            };
        case "!==":
            return {
                kind: "Primitive",
                value: leftValue !== rightValue,
            };
        case "===":
            return {
                kind: "Primitive",
                value: leftValue === rightValue,
            };
        case "%":
            return {
                kind: "Primitive",
                value: leftValue % rightValue,
            };
        case "**":
            return {
                kind: "Primitive",
                value: leftValue ** rightValue,
            };
        case "<<":
            return {
                kind: "Primitive",
                value: leftValue << rightValue,
            };
    }
}
function evaluateUpdateExpression(operand, operator, prefix) {
    if (operand.kind !== "Primitive" || typeof operand.value !== "number") {
        return null;
    }
    switch (operator) {
        case "++":
            return {
                kind: "Primitive",
                value: prefix ? operand.value + 1 : operand.value,
            };
        case "--":
            return {
                kind: "Primitive",
                value: prefix ? operand.value - 1 : operand.value,
            };
    }
}
function readConstant(constants, place) {
    return constants.get(place.identifier.id) ?? null;
}
function canAdd(left, right) {
    // symbols cannot be added.
    if (typeof left === "symbol" || typeof right === "symbol") {
        return false;
    }
    // strings can be concatenated with any primitive except symbols.
    if (typeof left === "string" || typeof right === "string") {
        return true;
    }
    // bigints can be added with other bigints or strings.
    if (typeof left === "bigint" || typeof right === "bigint") {
        return typeof left === "bigint" && typeof right === "bigint";
    }
    // numbers can be added with other numbers.
    if (typeof left === "number" && typeof right === "number") {
        return true;
    }
    return true;
}
function canArithmetic(left, right) {
    return typeof left === "number" && typeof right === "number";
}
