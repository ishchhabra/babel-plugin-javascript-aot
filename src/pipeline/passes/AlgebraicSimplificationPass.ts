import {
  BaseInstruction,
  BasicBlock,
  BinaryExpressionInstruction,
  IdentifierId,
  LiteralInstruction,
  LoadLocalInstruction,
  LogicalExpressionInstruction,
  StoreLocalInstruction,
  TPrimitiveValue,
} from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { Place } from "../../ir/core/Place";
import { BaseOptimizationPass } from "../late-optimizer/OptimizationPass";

/**
 * A pass that simplifies algebraic expressions where one operand is a known
 * literal and the other is not, using identity and annihilator rules.
 *
 * Examples:
 * - `x + 0` → `x`, `0 + x` → `x`
 * - `x - 0` → `x`
 * - `x * 1` → `x`, `1 * x` → `x`
 * - `x * 0` → `0` (when x is finite)
 * - `x | 0` → `x`, `x ^ 0` → `x`
 * - `x & 0` → `0`
 * - `x ** 1` → `x`, `x ** 0` → `1` (when x is finite)
 * - `true && x` → `x`, `false && x` → `false`
 * - `false || x` → `x`, `true || x` → `true`
 * - `null ?? x` → `x`
 *
 * This pass does NOT handle:
 * - Constant folding (both operands known) — handled by ConstantPropagationPass
 * - Strength reduction (e.g. `x ** 2` → `x * x`) — separate concern
 * - Unary constant folding (e.g. `!true`) — handled by ConstantPropagationPass
 */
export class AlgebraicSimplificationPass extends BaseOptimizationPass {
  /**
   * Maps identifier ids to their known literal values.
   * Tracks values through LiteralInstruction, LoadLocal, and StoreLocal chains.
   */
  private readonly literals: Map<IdentifierId, TPrimitiveValue>;

  constructor(protected readonly functionIR: FunctionIR) {
    super(functionIR);
    this.literals = new Map();

    // Pre-scan all blocks to find literal values, following LoadLocal/StoreLocal chains.
    for (const block of this.functionIR.blocks.values()) {
      for (const instruction of block.instructions) {
        if (instruction instanceof LiteralInstruction) {
          this.literals.set(instruction.place.identifier.id, instruction.value);
        } else if (instruction instanceof LoadLocalInstruction) {
          const val = this.literals.get(instruction.value.identifier.id);
          if (val !== undefined) {
            this.literals.set(instruction.place.identifier.id, val);
          }
        } else if (instruction instanceof StoreLocalInstruction) {
          const val = this.literals.get(instruction.value.identifier.id);
          if (val !== undefined) {
            this.literals.set(instruction.lval.identifier.id, val);
          }
        }
      }
    }
  }

  public step() {
    let changed = false;

    for (const block of this.functionIR.blocks.values()) {
      changed ||= this.simplifyBlock(block);
    }

    return { changed };
  }

  private simplifyBlock(block: BasicBlock): boolean {
    let changed = false;

    for (const [index, instruction] of block.instructions.entries()) {
      let replacement: BaseInstruction | undefined;

      if (instruction instanceof BinaryExpressionInstruction) {
        replacement = this.simplifyBinaryExpression(instruction);
      } else if (instruction instanceof LogicalExpressionInstruction) {
        replacement = this.simplifyLogicalExpression(instruction);
      }

      if (replacement !== undefined) {
        block.instructions[index] = replacement;
        if (replacement instanceof LiteralInstruction) {
          this.literals.set(replacement.place.identifier.id, replacement.value);
        }
        changed = true;
      }
    }

    return changed;
  }

  private getLiteral(place: Place): TPrimitiveValue | undefined {
    return this.literals.get(place.identifier.id);
  }

  private isLiteral(place: Place): boolean {
    return this.literals.has(place.identifier.id);
  }

  private isLiteralNumber(place: Place): boolean {
    if (!this.isLiteral(place)) return false;
    const val = this.getLiteral(place);
    return typeof val === "number";
  }

  private isInt32Literal(place: Place): boolean {
    if (!this.isLiteralNumber(place)) return false;
    const val = this.getLiteral(place) as number;
    return Number.isInteger(val) && val >= -2147483648 && val <= 2147483647;
  }

  private isFiniteNumber(place: Place): boolean {
    if (!this.isLiteralNumber(place)) return false;
    const val = this.getLiteral(place) as number;
    return Number.isFinite(val);
  }

  private forwardPlace(
    instruction: BaseInstruction,
    source: Place,
  ): BaseInstruction {
    return new LoadLocalInstruction(
      instruction.id,
      instruction.place,
      instruction.nodePath as LoadLocalInstruction["nodePath"],
      source,
    );
  }

  private makeLiteral(
    instruction: BaseInstruction,
    value: TPrimitiveValue,
  ): LiteralInstruction {
    return new LiteralInstruction(
      instruction.id,
      instruction.place,
      instruction.nodePath as LiteralInstruction["nodePath"],
      value,
    );
  }

  private simplifyBinaryExpression(
    instruction: BinaryExpressionInstruction,
  ): BaseInstruction | undefined {
    const leftLit = this.getLiteral(instruction.left);
    const rightLit = this.getLiteral(instruction.right);
    const leftIsLit = this.isLiteral(instruction.left);
    const rightIsLit = this.isLiteral(instruction.right);

    // Skip if both are known (ConstantPropagationPass handles that)
    // or if neither is known.
    if ((leftIsLit && rightIsLit) || (!leftIsLit && !rightIsLit)) {
      return undefined;
    }

    const op = instruction.operator;

    // Additive identity: x + 0 = x, 0 + x = x
    if (op === "+") {
      if (rightIsLit && rightLit === 0 && !leftIsLit) {
        return this.forwardPlace(instruction, instruction.left);
      }
      if (leftIsLit && leftLit === 0 && !rightIsLit) {
        return this.forwardPlace(instruction, instruction.right);
      }
    }

    // Subtractive identity: x - 0 = x
    if (op === "-") {
      if (rightIsLit && rightLit === 0 && !leftIsLit) {
        return this.forwardPlace(instruction, instruction.left);
      }
    }

    // Multiplicative identity/annihilator: x * 1 = x, x * 0 = 0
    if (op === "*") {
      if (rightIsLit && rightLit === 1 && !leftIsLit) {
        return this.forwardPlace(instruction, instruction.left);
      }
      if (leftIsLit && leftLit === 1 && !rightIsLit) {
        return this.forwardPlace(instruction, instruction.right);
      }
      if (
        rightIsLit &&
        rightLit === 0 &&
        this.isFiniteNumber(instruction.left)
      ) {
        return this.makeLiteral(instruction, 0);
      }
      if (
        leftIsLit &&
        leftLit === 0 &&
        this.isFiniteNumber(instruction.right)
      ) {
        return this.makeLiteral(instruction, 0);
      }
    }

    // Bitwise OR identity: x | 0 = x
    if (op === "|") {
      if (rightIsLit && rightLit === 0 && !leftIsLit) {
        return this.forwardPlace(instruction, instruction.left);
      }
      if (leftIsLit && leftLit === 0 && !rightIsLit) {
        return this.forwardPlace(instruction, instruction.right);
      }
    }

    // Bitwise AND annihilator: x & 0 = 0
    if (op === "&") {
      if (rightIsLit && rightLit === 0) {
        return this.makeLiteral(instruction, 0);
      }
      if (leftIsLit && leftLit === 0) {
        return this.makeLiteral(instruction, 0);
      }
    }

    // Bitwise XOR identity: x ^ 0 = x
    if (op === "^") {
      if (rightIsLit && rightLit === 0 && !leftIsLit) {
        return this.forwardPlace(instruction, instruction.left);
      }
      if (leftIsLit && leftLit === 0 && !rightIsLit) {
        return this.forwardPlace(instruction, instruction.right);
      }
    }

    // Exponentiation identity/annihilator: x ** 1 = x, x ** 0 = 1
    if (op === "**") {
      if (rightIsLit && rightLit === 1 && !leftIsLit) {
        return this.forwardPlace(instruction, instruction.left);
      }
      if (
        rightIsLit &&
        rightLit === 0 &&
        this.isFiniteNumber(instruction.left)
      ) {
        return this.makeLiteral(instruction, 1);
      }
    }

    return undefined;
  }

  private simplifyLogicalExpression(
    instruction: LogicalExpressionInstruction,
  ): BaseInstruction | undefined {
    const leftLit = this.getLiteral(instruction.left);
    const leftIsLit = this.isLiteral(instruction.left);
    const rightIsLit = this.isLiteral(instruction.right);

    // Only simplify when left is known and right is not.
    // If both are known, ConstantPropagationPass handles it.
    if (!leftIsLit || rightIsLit) {
      return undefined;
    }

    const op = instruction.operator;

    // Short-circuit: true && x = x, false && x = false
    if (op === "&&") {
      if (leftLit) {
        return this.forwardPlace(instruction, instruction.right);
      } else {
        return this.makeLiteral(instruction, leftLit);
      }
    }

    // Short-circuit: true || x = true, false || x = x
    if (op === "||") {
      if (leftLit) {
        return this.makeLiteral(instruction, leftLit);
      } else {
        return this.forwardPlace(instruction, instruction.right);
      }
    }

    // Nullish: null ?? x = x, undefined ?? x = x
    if (op === "??") {
      if (leftLit === null || leftLit === undefined) {
        return this.forwardPlace(instruction, instruction.right);
      } else {
        return this.makeLiteral(instruction, leftLit);
      }
    }

    return undefined;
  }
}
