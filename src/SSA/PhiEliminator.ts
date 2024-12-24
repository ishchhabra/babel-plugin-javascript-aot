import { Bindings } from "../HIR";
import { Block, BlockId } from "../HIR/Block";
import {
  AssignmentExpressionInstruction,
  StoreLocalInstruction,
} from "../HIR/Instruction";
import { LoadValue } from "../HIR/Value";
import { Phi } from "./Phi";

export function eliminatePhis(
  bindings: Bindings,
  blocks: Map<BlockId, Block>,
  phis: Set<Phi>,
) {
  new PhiEliminator(bindings, blocks, phis).eliminate();
}

// TODO: Phi elimination not working correctly for basic test case:
// - Not creating declarations at top of function
// - Not replacing variable access at merge points after if/else
// - Incorrect handling of SSA variable assignments and phi nodes
export class PhiEliminator {
  #bindings: Bindings;
  #blocks: Map<BlockId, Block>;
  #phis: Set<Phi>;

  constructor(bindings: Bindings, blocks: Map<BlockId, Block>, phis: Set<Phi>) {
    this.#bindings = bindings;
    this.#blocks = blocks;
    this.#phis = phis;
  }

  public eliminate(): Map<BlockId, Block> {
    for (const phi of this.#phis) {
      const declarationId = phi.place.identifier.declarationId;
      const declarationBindings = this.#bindings.get(declarationId);
      if (declarationBindings === undefined) {
        continue;
      }

      declarationBindings.get(phi.definition)!.identifier.name =
        phi.place.identifier.name;

      const declarationPlace = declarationBindings.get(phi.definition)!;
      const storeLocal = this.#blocks
        .get(phi.definition)
        ?.instructions.find(
          (instr) =>
            instr instanceof StoreLocalInstruction &&
            instr.target === declarationPlace,
        ) as StoreLocalInstruction | undefined;
      if (storeLocal) {
        storeLocal.type = "let";
      }

      const block = this.#blocks.get(phi.definition);
      if (block === undefined) {
        continue;
      }

      // For each predecessor, add move instructions at the end of the block
      for (const [predBlockId, predPlace] of phi.operands.entries()) {
        const predBlock = this.#blocks.get(predBlockId);
        if (!predBlock) continue;

        // Create a move instruction (store) for the phi operand
        const value = new LoadValue(predPlace);
        const instruction = new AssignmentExpressionInstruction(
          0,
          phi.place,
          value,
        );
        predBlock.instructions.push(instruction); // Add to the end of the predecessor block
      }

      // Finally, remove the phi node after replacing it
      for (let i = 0; i < block.instructions.length; i++) {
        const instruction = block.instructions[i];
        if (instruction instanceof StoreLocalInstruction) {
          // Replace phi usages with the actual assigned value
          if (
            instruction.value instanceof LoadValue &&
            instruction.value.place === phi.place
          ) {
            instruction.value.place = phi.operands.get(phi.definition)!;
          }
        }
      }

      this.#removePhiNodeFromBlock(phi, block);
    }

    return this.#blocks;
  }

  #removePhiNodeFromBlock(phi: Phi, block: Block) {
    block.instructions = block.instructions.filter(
      (instruction) =>
        !(
          instruction instanceof StoreLocalInstruction &&
          instruction.target === phi.place
        ),
    );
  }
}
