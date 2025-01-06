import { CopyInstruction, StoreLocalInstruction } from '../../ir/Instruction.js';
import { BaseOptimizationPass } from '../OptimizationPass.js';

/**
 * A late Dead Code Elimination (DCE) pass that removes unused instructions
 * which define a place not read by any other instruction in the block
 * (and have no side effects). This pass is less aggressive than the
 * early DCE pass, which runs before the SSA elimination and has access
 * to phi nodes information.
 *
 * It relies on each instruction implementing:
 *    `public getReadPlaces(): Place[] { ... }`
 * which returns the list of places that instruction *reads*.
 *
 * Also, each instruction that "defines" a place should do so in a known field
 * (e.g. `lval` for StoreLocal, or `argumentPlace` for a BinaryExpression, etc.).
 *
 * For instructions that are "pure" and produce a result that no one reads, we remove them.
 * If an instruction is "impure" (side effects, function calls, etc.), we keep it even if unused.
 *
 * NOTE: This pass is local. If a variable is used in a different block,
 * we won't see it here and might remove it incorrectly if you haven't accounted for that globally.
 */
class LateDeadCodeEliminationPass extends BaseOptimizationPass {
    step() {
        let changed = false;
        const usedPlaceIds = new Set();
        // Process blocks in post order
        for (const blockId of this.postOrder) {
            const block = this.blocks.get(blockId);
            if (!block) {
                throw new Error(`Block ${blockId} not found`);
            }
            try {
                const blockChanged = this.eliminateDeadCodeInBlock(block, usedPlaceIds);
                if (blockChanged) {
                    changed = true;
                }
            }
            catch {
                console.warn(`Skipping dead code elimination for block ${blockId} due to error`);
            }
        }
        return { changed };
    }
    eliminateDeadCodeInBlock(block, usedPlaceIds) {
        const instrs = block.instructions;
        const newInstrs = [];
        let changed = false;
        // 1) Gather "used" places (i.e., read by instructions in this block).
        //    Because each instruction implements getReadPlaces(), we just call it.
        for (const instr of instrs) {
            for (const place of instr.getReadPlaces()) {
                usedPlaceIds.add(place.identifier.id);
            }
        }
        // Also gather places read by the terminal
        if (block.terminal) {
            for (const place of block.terminal.getReadPlaces()) {
                usedPlaceIds.add(place.identifier.id);
            }
        }
        // 2) Filter out instructions that define a place that is never read
        //    (and have no side effects).
        for (const instr of instrs) {
            if (this.shouldKeepInstruction(instr, usedPlaceIds)) {
                newInstrs.push(instr);
            }
            else {
                // Instruction is considered dead, removing it.
                changed = true;
            }
        }
        block.instructions = newInstrs;
        return changed;
    }
    /**
     * Decide if we keep this instruction:
     *   1) If it doesn't "define" any place, we keep it by default unless
     *      it's a pure instruction with no side effects (like a pure call returning
     *      a value that is never used).
     *   2) If it's pure (like a store or copy with no side effects) and
     *      defines a place that is not in usedPlaceIds, remove it.
     *   3) Otherwise keep it.
     */
    shouldKeepInstruction(instruction, usedPlaceIds) {
        // Do not remove copy instructions, since they are inserted by the SSA transformation.
        // If there are opportunities for dead code elimination involving assignment,
        // they can be removed by the EarlyDeadCodeEliminationPass which has access to phi nodes.
        if (instruction instanceof CopyInstruction) {
            return true;
        }
        // If the instruction is not pure, it might have side effects => keep it
        if (!instruction.isPure) {
            return true;
        }
        // When using StoreLocalInstruction, the instruction place is never read,
        // but the lval is read.
        if (instruction instanceof StoreLocalInstruction) {
            return usedPlaceIds.has(instruction.lval.identifier.id);
        }
        // Keep the instruction if the place it defines is read
        return usedPlaceIds.has(instruction.place.identifier.id);
    }
}

export { LateDeadCodeEliminationPass };
//# sourceMappingURL=LateDeadCodeEliminationPass.js.map
