import {
  BasicBlock,
  BlockId,
  IdentifierId,
  LiteralInstruction,
} from "../../frontend/ir";
import {
  BaseInstruction,
  BinaryExpressionInstruction,
  TPrimitiveValue,
  UnaryExpressionInstruction,
} from "../../frontend/ir/Instruction";

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
export class ConstantPropagationPass {
  private readonly constants: Map<IdentifierId, TPrimitiveValue>;

  constructor(
    private readonly path: string,
    private readonly blocks: Map<BlockId, BasicBlock>,
    private readonly context: Map<
      string,
      Map<string, Map<IdentifierId, TPrimitiveValue>>
    >,
  ) {
    let globalConstants = this.context.get("constants");
    if (globalConstants === undefined) {
      globalConstants = new Map<string, Map<IdentifierId, TPrimitiveValue>>();
      this.context.set("constants", globalConstants);
    }

    let constants = globalConstants.get(this.path);
    if (constants === undefined) {
      constants = new Map<IdentifierId, TPrimitiveValue>();
      globalConstants.set(this.path, constants);
    }

    this.constants = constants;
  }

  public run() {
    for (const block of this.blocks.values()) {
      this.propagateConstantsInBlock(block);
    }

    return { blocks: this.blocks };
  }

  private propagateConstantsInBlock(block: BasicBlock) {
    for (const [index, instruction] of block.instructions.entries()) {
      const result = this.evaluateInstruction(instruction);
      if (result !== undefined) {
        block.instructions[index] = result;
      }
    }
  }

  private evaluateInstruction(instruction: BaseInstruction) {
    if (instruction instanceof LiteralInstruction) {
      return this.evaluateLiteralInstruction(instruction);
    } else if (instruction instanceof BinaryExpressionInstruction) {
      return this.evaluateBinaryExpressionInstruction(instruction);
    } else if (instruction instanceof UnaryExpressionInstruction) {
      return this.evaluateUnaryExpressionInstruction(instruction);
    }

    return undefined;
  }

  private evaluateLiteralInstruction(instruction: LiteralInstruction) {
    this.constants.set(instruction.place.identifier.id, instruction.value);
  }

  private evaluateBinaryExpressionInstruction(
    instruction: BinaryExpressionInstruction,
  ) {
    const left = this.constants.get(instruction.left.identifier.id);
    const right = this.constants.get(instruction.right.identifier.id);

    if (left === undefined || right === undefined) {
      return undefined;
    }

    let result: TPrimitiveValue;
    switch (instruction.operator) {
      case "+":
        result = (left as number) + (right as number);
        break;
      case "-":
        result = (left as number) - (right as number);
        break;
      case "*":
        result = (left as number) * (right as number);
        break;
      case "/":
        result = (left as number) / (right as number);
        break;
      case "|":
        result = (left as number) | (right as number);
        break;
      case "&":
        result = (left as number) & (right as number);
        break;
      case "^":
        result = (left as number) ^ (right as number);
        break;
      case ">>":
        result = (left as number) >> (right as number);
        break;
      case ">>>":
        result = (left as number) >>> (right as number);
        break;
      case "==":
        result = left === right;
        break;
      case "!=":
        result = left !== right;
        break;
      case ">":
        result = (left as number) > (right as number);
        break;
      case ">=":
        result = (left as number) >= (right as number);
        break;
      case "<":
        result = (left as number) < (right as number);
        break;
      case "<=":
        result = (left as number) <= (right as number);
        break;
      case "!==":
        result = left !== right;
        break;
      case "===":
        result = left === right;
        break;
      case "%":
        result = (left as number) % (right as number);
        break;
      case "**":
        result = (left as number) ** (right as number);
        break;
      case "<<":
        result = (left as number) << (right as number);
        break;
      default:
        return undefined;
    }

    this.constants.set(instruction.place.identifier.id, result);
    return new LiteralInstruction(
      instruction.id,
      instruction.place,
      instruction.nodePath,
      result,
    );
  }

  private evaluateUnaryExpressionInstruction(
    instruction: UnaryExpressionInstruction,
  ) {
    const operand = this.constants.get(instruction.argument.identifier.id);
    if (operand === undefined) {
      return undefined;
    }

    let result: TPrimitiveValue;
    switch (instruction.operator) {
      case "!":
        result = !operand;
        break;
      case "-":
        result = -(operand as number);
        break;
      case "~":
        result = ~(operand as number);
        break;
      case "+":
        result = +(operand as number);
        break;
      default:
        return undefined;
    }

    this.constants.set(instruction.place.identifier.id, result);
    return new LiteralInstruction(
      instruction.id,
      instruction.place,
      instruction.nodePath,
      result,
    );
  }
}
