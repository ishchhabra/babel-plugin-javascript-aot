import {
  BaseInstruction,
  BasicBlock,
  CopyInstruction,
  IdentifierId,
  LoadLocalInstruction,
  Place,
  StoreLocalInstruction,
} from "../ir";
import { BaseOptimizationPass, OptimizationResult } from "./OptimizationPass";

/**
 * A pass that forwards the source of a "Store → (expression instructions) → Copy"
 * sequence into the final store. For example:
 *
 * ```js
 * const temp = 10;    // (1)
 * const final = temp;  // (2)
 * ```
 *
 * In IR, this might appear as three instructions in the same block:
 *
 *  1) `StoreLocal(place0, temp, 10)`        // temp = 10
 *  2) `LoadLocal(place1, temp)`
 *  3) `Copy(place2, final, place1)`  // final = temp
 *
 * This pass **forwards** the value `10` directly into the final Copy,
 * producing:
 *
 * ```js
 * const temp = 10;
 * const final = 10;
 * ```
 *
 * This optimization is particularly effective at simplifying and optimizing code
 * after phi elimination, which inserts copy instructions, by reducing redundant
 * sequences and eliminating unnecessary temporary variables.
 */
export class LoadStoreForwardingPass extends BaseOptimizationPass {
  protected step(): OptimizationResult {
    let changed = false;

    for (const block of this.blocks.values()) {
      const blockChanged = this.propagateStoreLoadStore(block);
      if (blockChanged) {
        changed = true;
      }
    }
    return { changed };
  }

  /**
   * Scans for consecutive triples:
   *
   *   StoreLocal(place0, temp, X)
   *   LoadLocal(place1, temp)
   *   StoreLocal(place2, final, place1)
   *
   * If found, we rewrite the final store to `StoreLocal(final, X)`,
   * but keep the first two instructions exactly as-is.
   */
  private propagateStoreLoadStore(block: BasicBlock): boolean {
    const instrs = block.instructions;
    const newInstrs: BaseInstruction[] = [];

    let changed = false;
    for (let i = 0; i < instrs.length; i++) {
      // If we don't have at least 2 more instructions ahead,
      // then the triplet does not exist.
      if (i + 2 >= instrs.length) {
        newInstrs.push(instrs[i]);
        continue;
      }

      const instr1 = instrs[i];
      const instr2 = instrs[i + 1];
      const instr3 = instrs[i + 2];

      if (
        instr1 instanceof StoreLocalInstruction &&
        instr2 instanceof LoadLocalInstruction &&
        instr3 instanceof CopyInstruction
      ) {
        const tempId = instr1.lval.identifier.id;
        const loadFromId = instr2.value.identifier.id;

        const tmpLoadId = instr2.place.identifier.id;
        const store3SourceId = instr3.value.identifier.id;

        if (loadFromId === tempId && store3SourceId === tmpLoadId) {
          // We found the 3-instruction chain:
          //   store1: temp = X
          //   load2: tmpLoad = temp
          //   store3: final = tmpLoad

          // Let's get the source 'X' from store1
          const xPlace = instr1.value;
          // Rewrite store3 to store that 'xPlace' directly
          const updatedStore3 = rewriteStoreSource(instr3, xPlace);

          // We'll push store1, load2, updatedStore3 to newInstrs
          newInstrs.push(instr1);
          newInstrs.push(instr2);
          newInstrs.push(updatedStore3);

          changed = true;
          // Skip the next 2 instructions since we've already handled them
          i += 2;
          continue;
        }
      }

      // Default: if no match, just keep the instruction
      newInstrs.push(instrs[i]);
    }

    block.instructions = newInstrs;
    return changed;
  }
}

/**
 * Rewrite a StoreLocalInstruction's 'value' with a new place.
 * We do this by building a small rewrite map and calling `rewriteInstruction()`.
 */
function rewriteStoreSource(
  storeInstr: CopyInstruction,
  newValue: Place
): CopyInstruction {
  const oldValueId = storeInstr.value.identifier.id;
  const rewriteMap = new Map<IdentifierId, Place>([[oldValueId, newValue]]);

  const updated = storeInstr.rewriteInstruction(rewriteMap);
  // 'updated' will be a new CopyInstruction instance;
  // we can safely cast if we are sure the rewriting won't change the class.
  return updated as CopyInstruction;
}
