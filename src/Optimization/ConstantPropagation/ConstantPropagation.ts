import { BasicBlock, BlockId, IdentifierId } from "../../HIR";
import {
  BinaryExpressionInstruction,
  LiteralInstruction,
  UnaryExpressionInstruction,
} from "../../HIR/Instruction";
import { TPrimitiveValue } from "../../HIR/Value";

export function constantPropagation(blocks: Map<BlockId, BasicBlock>) {
  new ConstantPropagation(blocks).optimize();
}

class ConstantPropagation {
  #blocks: Map<BlockId, BasicBlock>;
  #constants: Map<IdentifierId, TPrimitiveValue> = new Map();

  constructor(blocks: Map<BlockId, BasicBlock>) {
    this.#blocks = blocks;
  }

  public optimize(): void {
    for (const block of this.#blocks.values()) {
      this.#optimizeBlock(block);
    }
  }

  #optimizeBlock(block: BasicBlock): void {
    for (const [i, instruction] of block.instructions.entries()) {
      if (instruction instanceof LiteralInstruction) {
        this.#constants.set(
          instruction.target.identifier.id,
          instruction.value,
        );
        continue;
      }

      if (instruction instanceof UnaryExpressionInstruction) {
        const result = this.#evaluateUnaryExpression(instruction);
        if (result !== undefined) {
          this.#constants.set(instruction.target.identifier.id, result);
          block.instructions[i] = new LiteralInstruction(
            instruction.id,
            instruction.target,
            result,
          );
          continue;
        }
      }

      if (instruction instanceof BinaryExpressionInstruction) {
        const result = this.#evaluateBinaryExpression(instruction);
        if (result !== undefined) {
          this.#constants.set(instruction.target.identifier.id, result);
          block.instructions[i] = new LiteralInstruction(
            instruction.id,
            instruction.target,
            result,
          );
          continue;
        }
      }
    }
  }

  #evaluateUnaryExpression(
    instruction: UnaryExpressionInstruction,
  ): TPrimitiveValue | undefined {
    const operand = this.#constants.get(instruction.value.identifier.id);
    if (operand === undefined) {
      return undefined;
    }

    switch (instruction.operator) {
      case "!":
        return !operand;
      case "~":
        if (typeof operand !== "number" && typeof operand !== "bigint") {
          return undefined;
        }
        return ~operand;
      case "-":
        return -(operand as number);
      case "+":
        return +(operand as number);
    }
  }

  #evaluateBinaryExpression(
    instruction: BinaryExpressionInstruction,
  ): TPrimitiveValue | undefined {
    const left = this.#constants.get(instruction.left.identifier.id);
    const right = this.#constants.get(instruction.right.identifier.id);
    if (left === undefined || right === undefined) {
      return undefined;
    }

    switch (instruction.operator) {
      case "+":
        return (left as number) + (right as number);
      case "-":
        return (left as number) - (right as number);
      case "*":
        return (left as number) * (right as number);
      case "/":
        return (left as number) / (right as number);
      case "|":
        return (left as number) | (right as number);
      case "&":
        return (left as number) & (right as number);
      case "^":
        return (left as number) ^ (right as number);
      case ">>":
        return (left as number) >> (right as number);
      case ">>>":
        return (left as number) >>> (right as number);
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case ">":
        return (left as number) > (right as number);
      case ">=":
        return (left as number) >= (right as number);
      case "<":
        return (left as number) < (right as number);
      case "<=":
        return (left as number) <= (right as number);
      case "!==":
        return left !== right;
      case "===":
        return left === right;
      case "%":
        return (left as number) % (right as number);
      case "**":
        return (left as number) ** (right as number);
      case "<<":
        return (left as number) << (right as number);
    }
  }
}
