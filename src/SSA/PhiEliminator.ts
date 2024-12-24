import { Block, BlockId } from "../HIR/Block";
import {
  AssignmentExpressionInstruction,
  StoreLocalInstruction,
} from "../HIR/Instruction";
import { Value } from "../HIR/Value";
import { Phi } from "./Phi";

export function eliminatePhis(blocks: Map<BlockId, Block>, phis: Set<Phi>) {
  new PhiEliminator(blocks, phis).eliminate();
}

// TODO: Phi elimination not working correctly for basic test case:
// - Not creating declarations at top of function
// - Not replacing variable access at merge points after if/else
// - Incorrect handling of SSA variable assignments and phi nodes
export class PhiEliminator {
  #blocks: Map<BlockId, Block>;
  #phis: Set<Phi>;

  constructor(blocks: Map<BlockId, Block>, phis: Set<Phi>) {
    this.#blocks = blocks;
    this.#phis = phis;
  }

  public eliminate(): Map<BlockId, Block> {
    for (const phi of this.#phis) {
      const block = this.#blocks.get(phi.source);
      if (block === undefined) {
        continue;
      }

      // For each predecessor, add move instructions at the end of the block
      for (const [predBlockId, predPlace] of phi.operands.entries()) {
        const predBlock = this.#blocks.get(predBlockId);
        if (!predBlock) continue;

        // Create a move instruction (store) for the phi operand
        const value: Value = { kind: "Load", place: predPlace };
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
            instruction.value.kind === "Load" &&
            instruction.value.place === phi.place
          ) {
            instruction.value.place = phi.operands.get(phi.source)!;
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
