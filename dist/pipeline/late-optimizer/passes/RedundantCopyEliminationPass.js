import { CopyInstruction } from '../../../ir/instructions/memory/CopyInstruction.js';
import { LoadLocalInstruction } from '../../../ir/instructions/memory/LoadLocal.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { BaseOptimizationPass } from '../OptimizationPass.js';

/**
 * A pass that removes redundant writes (copies) to the same location
 * when no intervening read occurs. For example:
 *
 * ```js
 * let x = 0;
 * x = 1; // This store overwrites x=0 without reading x in between
 * ```
 *
 * The second store to `x` makes the first one redundant (i.e., has no effect
 * on program behavior). This pass detects such patterns and removes the
 * earlier store.
 *
 * In IR, this might look like:
 *
 *  1) `BindingIdentifierInstruction(place0, "x")`
 *  2) `LiteralInstruction(place1, 0)`
 *  3) `StoreLocalInstruction(place2, place0, place1)`
 *  4) `BindingIdentifierInstruction(place3, "x")`
 *  5) `LiteralInstruction(place4, 1)`
 *  6) `CopyInstruction(place5, place3, place4)`
 *
 * After elimination, the IR becomes:
 *
 *  1) `BindingIdentifierInstruction(place3, "x")`
 *  2) `LiteralInstruction(place4, 1)`
 *  3) `StoreLocalInstruction(place5, place3, place4)`
 *
 * yielding more efficient code that looks like:
 *
 * ```js
 * let x = 1;
 * ```
 *
 * This optimization is particularly effective at simplifying and optimizing code
 * after phi elimination, which inserts copy instructions, by reducing redundant
 * sequences and eliminating unnecessary temporary variables.
 */
class RedundantCopyEliminationPass extends BaseOptimizationPass {
    step() {
        let changed = false;
        for (const block of this.moduleUnit.blocks.values()) {
            const blockChanged = this.eliminateRedundantCopiesInBlock(block);
            if (blockChanged) {
                changed = true;
            }
        }
        return { changed };
    }
    /**
     * Scans the instructions in a basic block to remove redundant stores/copies.
     * A "redundant write" is a CopyInstruction to the same declarationId that is
     * not read before the next write.
     */
    eliminateRedundantCopiesInBlock(block) {
        const instrs = block.instructions;
        let changed = false;
        /**
         * Maps a declarationId → the **index** of the most recent instruction
         * that wrote to that variable, which has not yet been invalidated
         * by a read.
         *
         * If we see another write to the same declarationId, the old one is
         * redundant (never read), so we remove it.
         */
        const lastWriteIndexForDecl = new Map();
        for (let i = 0; i < instrs.length; i++) {
            const instr = instrs[i];
            if (instr instanceof StoreLocalInstruction) {
                lastWriteIndexForDecl.set(instr.lval.identifier.declarationId, i);
            }
            else if (instr instanceof CopyInstruction) {
                // If there's a pending write to the same declId, remove it.
                if (lastWriteIndexForDecl.has(instr.lval.identifier.declarationId)) {
                    const oldIndex = lastWriteIndexForDecl.get(instr.lval.identifier.declarationId);
                    const lastInstr = instrs[oldIndex];
                    instrs.splice(oldIndex, 1);
                    if (lastInstr instanceof StoreLocalInstruction) {
                        instrs[i] = new StoreLocalInstruction(instr.id, instr.place, instr.nodePath, instr.lval, instr.value, lastInstr.type);
                    }
                    i--;
                    changed = true;
                }
                // This copy is the newest write to that variable
                lastWriteIndexForDecl.set(instr.lval.identifier.declarationId, i);
            }
            else if (instr instanceof LoadLocalInstruction) {
                // A load means "reading" from a variable => the prior write is not redundant
                const sourceDeclId = instr.value.identifier.declarationId;
                lastWriteIndexForDecl.delete(sourceDeclId);
            }
        }
        return changed;
    }
}

export { RedundantCopyEliminationPass };
//# sourceMappingURL=RedundantCopyEliminationPass.js.map
