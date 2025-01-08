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
} from "../../frontend/ir/Instruction";

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

    const result = (left as number) + (right as number);
    this.constants.set(instruction.place.identifier.id, result);
    return new LiteralInstruction(
      instruction.id,
      instruction.place,
      instruction.nodePath,
      result,
    );
  }
}
