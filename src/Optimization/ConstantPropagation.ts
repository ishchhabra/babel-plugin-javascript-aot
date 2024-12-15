import * as t from "@babel/types";
import { BasicBlock, BlockId } from "../HIR/Block";
import { IdentifierId } from "../HIR/Identifier";
import { Instruction } from "../HIR/Instruction";
import { Place } from "../HIR/Place";

type Primitive = string | number | boolean | null | undefined | bigint | symbol;

type Constant = {
  readonly kind: "Primitive";
  readonly value: Primitive;
};

type Constants = Map<IdentifierId, Constant>;

type ConstantPropagationOptions = {
  debug?: boolean;
  maxIterations?: number;
};

type OptimizationStats = {
  iterations: number;
  optimizationsApplied: number;
};

const DEFAULT_OPTIONS: Required<ConstantPropagationOptions> = {
  debug: false,
  maxIterations: 1000,
};

export function constantPropagation(
  blocks: Map<BlockId, BasicBlock>,
  options?: ConstantPropagationOptions,
): OptimizationStats {
  if (!blocks || blocks.size === 0) {
    return { iterations: 0, optimizationsApplied: 0 };
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const constants: Constants = new Map();
  let iteration = 0;
  let totalOptimizations = 0;

  while (iteration < opts.maxIterations) {
    if (opts.debug) {
      console.log(`\n--- Iteration ${iteration} ---`);
    }

    const result = applyConstantPropagation(blocks, constants, opts.debug);
    if (!result.hasChanges) break;

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

type PropagationResult = {
  hasChanges: boolean;
  optimizationsApplied: number;
};

function applyConstantPropagation(
  blocks: Map<BlockId, BasicBlock>,
  constants: Constants,
  debug: boolean,
): PropagationResult {
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

function processBlock(
  block: BasicBlock,
  constantCache: Map<IdentifierId, Constant>,
  debug: boolean,
): PropagationResult {
  let hasChanges = false;
  let optimizationsApplied = 0;

  for (let i = 0; i < block.instructions.length; i++) {
    const instruction = block.instructions[i];
    if (!instruction) continue;

    try {
      const evaluatedValue = evaluateInstruction(constantCache, instruction);

      if (evaluatedValue !== null) {
        const targetId = instruction.target.identifier.id;
        const existingValue = constantCache.get(targetId);

        // Only count as a change if the value is different from what we had before
        const isNewValue =
          !existingValue ||
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
            place: instruction.target,
            value: {
              kind: "Primitive",
              value: evaluatedValue.value,
            },
          };

          hasChanges = true;
          optimizationsApplied++;

          if (debug) {
            console.log(
              `Optimized instruction ${instruction.id}: ${JSON.stringify(
                evaluatedValue,
              )}`,
            );
          }
        }
      }
    } catch (error) {
      if (debug) {
        console.error(`Error processing instruction ${instruction.id}:`, error);
      }
    }
  }

  return { hasChanges, optimizationsApplied };
}

function evaluateInstruction(
  constants: Constants,
  instruction: Instruction,
): Constant | null {
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
      if (operand === null) return null;
      return evaluateUnaryExpression(operand, instruction.operator);
    }

    case "BinaryExpression": {
      const left = readConstant(constants, instruction.left);
      const right = readConstant(constants, instruction.right);
      if (left === null || right === null) return null;
      return evaluateBinaryExpression(left, right, instruction.operator);
    }

    case "UpdateExpression": {
      const operand = readConstant(constants, instruction.value);
      if (operand === null) return null;
      return evaluateUpdateExpression(
        operand,
        instruction.operator,
        instruction.prefix,
      );
    }

    default:
      return null;
  }
}

function evaluateUnaryExpression(
  operand: Constant,
  operator: "!" | "~",
): Constant | null {
  switch (operator) {
    case "!":
      return { kind: "Primitive", value: !operand.value };
    case "~":
      if (
        typeof operand.value !== "number" &&
        typeof operand.value !== "bigint"
      ) {
        return null;
      }
      return { kind: "Primitive", value: ~operand.value };
  }
}

function evaluateBinaryExpression(
  left: Constant,
  right: Constant,
  operator: string,
): Constant | null {
  if (left.value == null || right.value == null) {
    return null;
  }

  const leftValue = left.value;
  const rightValue = right.value;

  if (
    (typeof leftValue !== "number" && typeof leftValue !== "bigint") ||
    (typeof rightValue !== "number" && typeof rightValue !== "bigint")
  ) {
    return null;
  }

  try {
    if (typeof leftValue === "bigint" && typeof rightValue === "bigint") {
      switch (operator) {
        case "+":
          return { kind: "Primitive", value: leftValue + rightValue };
        case "-":
          return { kind: "Primitive", value: leftValue - rightValue };
        case "*":
          return { kind: "Primitive", value: leftValue * rightValue };
        case "/":
          if (rightValue === 0n) throw new Error("Division by zero");
          return { kind: "Primitive", value: leftValue / rightValue };
      }
    }

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      switch (operator) {
        case "+":
          return { kind: "Primitive", value: leftValue + rightValue };
        case "-":
          return { kind: "Primitive", value: leftValue - rightValue };
        case "*":
          return { kind: "Primitive", value: leftValue * rightValue };
        case "/":
          if (rightValue === 0) throw new Error("Division by zero");
          return { kind: "Primitive", value: leftValue / rightValue };
      }
    }

    return null;
  } catch {
    return null;
  }
}

function evaluateUpdateExpression(
  operand: Constant,
  operator: t.UpdateExpression["operator"],
  prefix: boolean,
): Constant | null {
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

function readConstant(constants: Constants, place: Place): Constant | null {
  return constants.get(place.identifier.id) ?? null;
}
