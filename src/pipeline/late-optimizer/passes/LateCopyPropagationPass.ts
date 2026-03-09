import {
  BaseInstruction,
  BasicBlock,
  CopyInstruction,
  Identifier,
  IdentifierId,
  LiteralInstruction,
  LoadLocalInstruction,
  Place,
  PlaceId,
  StoreLocalInstruction,
} from "../../../ir";
import { BaseOptimizationPass, OptimizationResult } from "../OptimizationPass";

interface ForwardEntry {
  place: Place;
  /** Variable binding IDs that the forwarded expression depends on */
  readBindingIds: Set<IdentifierId>;
}

/**
 * Late Copy Propagation Pass
 *
 * Eliminates redundant variable copies by tracking simple assignments like
 * `const a = b` (where b is a variable or literal) and replacing subsequent
 * reads of `a` with reads of `b`.
 *
 * Two maps are maintained:
 * - copyMap: for LoadLocal/Literal sources, maps lval → source binding/literal
 *   place. Used for LoadLocal propagation (chains through variable copies).
 * - valueForwardMap: for ALL const StoreLocals, maps lval → the StoreLocal's
 *   value place. Used for CopyInstruction propagation (inlines expression
 *   results at phi copy sites). Safety is ensured by checking that no previous
 *   CopyInstruction in the same block modified any variable the expression reads.
 *
 * After propagation, the original copy becomes dead and is removed by DCE.
 */
export class LateCopyPropagationPass extends BaseOptimizationPass {
  protected step(): OptimizationResult {
    let changed = false;

    const copyMap = new Map<IdentifierId, Place>();
    const valueForwardMap = new Map<IdentifierId, ForwardEntry>();
    const placeToInstr = new Map<PlaceId, BaseInstruction>();

    for (const block of this.functionIR.blocks.values()) {
      if (
        this.propagateInBlock(block, copyMap, valueForwardMap, placeToInstr)
      ) {
        changed = true;
      }
    }

    return { changed };
  }

  private propagateInBlock(
    block: BasicBlock,
    copyMap: Map<IdentifierId, Place>,
    valueForwardMap: Map<IdentifierId, ForwardEntry>,
    placeToInstr: Map<PlaceId, BaseInstruction>,
  ): boolean {
    let changed = false;

    // Track variable bindings modified by CopyInstructions in this block.
    // Used to prevent forwarding expressions that read stale values.
    const modifiedByPrevCopy = new Set<IdentifierId>();

    for (let i = 0; i < block.instructions.length; i++) {
      const instr = block.instructions[i];
      placeToInstr.set(instr.place.id, instr);

      if (instr instanceof StoreLocalInstruction) {
        // Propagate copies through StoreLocal values (e.g., `let $phi = $0_0` → `let $phi = 5`)
        const valueReplacement = this.resolve(
          copyMap,
          instr.value.identifier.id,
        );
        if (valueReplacement && valueReplacement !== instr.value) {
          const rewriteMap = new Map<Identifier, Place>([
            [instr.value.identifier, valueReplacement],
          ]);
          const rewritten = instr.rewrite(rewriteMap);
          block.instructions[i] = rewritten;
          placeToInstr.set(rewritten.place.id, rewritten);
          changed = true;
        }

        if (instr.type !== "const") {
          // Mutable binding — invalidate any previous copyMap entry,
          // since the value may be reassigned (e.g., phi variables in loops).
          copyMap.delete(instr.lval.identifier.id);
        } else {
          // Re-read instruction after potential rewrite
          const current = block.instructions[i] as StoreLocalInstruction;

          // For ALL const StoreLocals, map lval → value place (for CopyInstruction).
          // Track which variable bindings the expression depends on.
          const valueInstr = placeToInstr.get(current.value.id);
          const readBindingIds = new Set<IdentifierId>();
          if (valueInstr) {
            for (const p of valueInstr.getReadPlaces()) {
              const producer = placeToInstr.get(p.id);
              if (producer instanceof LoadLocalInstruction) {
                readBindingIds.add(producer.value.identifier.id);
              } else {
                readBindingIds.add(p.identifier.id);
              }
            }
          }
          valueForwardMap.set(current.lval.identifier.id, {
            place: current.value,
            readBindingIds,
          });

          // For LoadLocal/Literal sources, also map in copyMap (for LoadLocal chaining)
          if (valueInstr instanceof LoadLocalInstruction) {
            copyMap.set(current.lval.identifier.id, valueInstr.value);
          } else if (valueInstr instanceof LiteralInstruction) {
            copyMap.set(current.lval.identifier.id, valueInstr.place);
          } else if (valueInstr === undefined) {
            // Value comes from a phi variable or cross-block binding —
            // map directly to the value place for copy chaining
            copyMap.set(current.lval.identifier.id, current.value);
          }
        }
      }

      // Propagate copies through LoadLocal instructions
      if (instr instanceof LoadLocalInstruction) {
        const replacement = this.resolve(copyMap, instr.value.identifier.id);
        if (replacement && replacement !== instr.value) {
          const rewriteMap = new Map<Identifier, Place>([
            [instr.value.identifier, replacement],
          ]);
          const rewritten = instr.rewrite(rewriteMap);
          block.instructions[i] = rewritten;
          placeToInstr.set(rewritten.place.id, rewritten);
          changed = true;
        }
      }

      // Propagate copies through CopyInstruction (phi updates like `$phi = $temp`)
      if (instr instanceof CopyInstruction) {
        // Try deep copy resolution first, then safe value forwarding
        let replacement = this.resolve(copyMap, instr.value.identifier.id);
        if (!replacement) {
          const entry = valueForwardMap.get(instr.value.identifier.id);
          // Only forward if no previous CopyInstruction in this block has
          // modified any variable the expression depends on
          if (
            entry &&
            !this.hasOverlap(entry.readBindingIds, modifiedByPrevCopy)
          ) {
            replacement = entry.place;
          }
        }
        if (replacement && replacement !== instr.value) {
          const rewriteMap = new Map<Identifier, Place>([
            [instr.value.identifier, replacement],
          ]);
          const rewritten = instr.rewrite(rewriteMap);
          block.instructions[i] = rewritten;
          changed = true;
        }

        // CopyInstruction reassigns a mutable binding — invalidate its copyMap entry.
        copyMap.delete(instr.lval.identifier.id);
        modifiedByPrevCopy.add(instr.lval.identifier.id);
      }
    }

    return changed;
  }

  private hasOverlap(a: Set<IdentifierId>, b: Set<IdentifierId>): boolean {
    for (const id of a) {
      if (b.has(id)) return true;
    }
    return false;
  }

  /**
   * Follow the copy chain to find the ultimate source.
   * E.g., if a = b, b = c, then resolve(a) = c.
   */
  private resolve(
    copyMap: Map<IdentifierId, Place>,
    id: IdentifierId,
  ): Place | undefined {
    const visited = new Set<IdentifierId>();
    let current = id;
    let result: Place | undefined;

    while (copyMap.has(current) && !visited.has(current)) {
      visited.add(current);
      result = copyMap.get(current)!;
      current = result.identifier.id;
    }

    return result;
  }
}
