import 'lodash-es';
import { CopyInstruction } from '../../../ir/instructions/memory/CopyInstruction.js';
import { LoadLocalInstruction } from '../../../ir/instructions/memory/LoadLocal.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { BaseOptimizationPass } from '../OptimizationPass.js';

/**
 * A pass that forwards the source of a "Store → (neutral instructions) → Copy/Store"
 * sequence into the final store.
 *
 * For example:
 *
 * ```js
 * const temp = 10;
 * const final = temp;
 * ```
 *
 * might appear as:
 *
 *  1) `StoreLocal(place0, temp, 10)`  // temp = 10
 *  2) `BindingIdentifierInstruction(place1, "final")`
 *  3) `LoadLocal(place2, temp)`
 *  4) `StoreLocal(place3, place1, place2)` // final = temp
 *
 * We can forward `10` into the final `StoreLocal`, producing:
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
class LoadStoreForwardingPass extends BaseOptimizationPass {
    step() {
        let changed = false;
        for (const block of this.functionIR.blocks.values()) {
            const blockChanged = this.propagateStoreLoadStore(block);
            if (blockChanged) {
                changed = true;
            }
        }
        return { changed };
    }
    propagateStoreLoadStore(block) {
        const instrs = block.instructions;
        const newInstrs = [];
        let changed = false;
        for (let i = 0; i < instrs.length; i++) {
            const current = instrs[i];
            // 1) If the current instruction is neutral, just keep it and continue.
            if (isNeutral(current)) {
                newInstrs.push(current);
                continue;
            }
            // 2) Try to find the next two non-neutral instructions
            const i2 = findNextMeaningful(instrs, i + 1);
            if (i2 === -1) {
                // Not enough instructions left to form a triple.
                newInstrs.push(current);
                continue;
            }
            const i3 = findNextMeaningful(instrs, i2 + 1);
            if (i3 === -1) {
                // Still not enough instructions left.
                // Push everything from i to i2 as normal.
                newInstrs.push(current);
                // Also push any neutral instructions between i+1 and i2
                pushAllBetween(instrs, i + 1, i2, newInstrs);
                // Then push the i2-th instruction
                newInstrs.push(instrs[i2]);
                i = i2; // Jump to i2
                continue;
            }
            // 3) We have three meaningful instructions: instrs[i], instrs[i2], instrs[i3]
            const instr1 = instrs[i];
            const instr2 = instrs[i2];
            const instr3 = instrs[i3];
            if (instr1 instanceof StoreLocalInstruction &&
                instr2 instanceof LoadLocalInstruction &&
                (instr3 instanceof CopyInstruction ||
                    instr3 instanceof StoreLocalInstruction)) {
                // Check for the pattern: temp = X; tmpLoad = temp; final = tmpLoad
                const tempId = instr1.lval.identifier.id;
                const loadFromId = instr2.value.identifier.id;
                const tmpLoadId = instr2.place.identifier.id;
                const store3SourceId = instr3.value.identifier.id;
                if (loadFromId === tempId && store3SourceId === tmpLoadId) {
                    // Found a triple chain - forward the source from instr1 to instr3
                    const xPlace = instr1.value;
                    const updatedStore3 = rewriteStoreSource(instr3, xPlace);
                    // Push instr1
                    newInstrs.push(instr1);
                    // Push any neutral instructions between i+1 and i2
                    pushAllBetween(instrs, i + 1, i2, newInstrs);
                    // Push instr2
                    newInstrs.push(instr2);
                    // Push any neutral instructions between i2+1 and i3
                    pushAllBetween(instrs, i2 + 1, i3, newInstrs);
                    // Push updated store instruction
                    newInstrs.push(updatedStore3);
                    changed = true;
                    // Advance i to i3 (we’ve effectively handled them)
                    i = i3;
                    continue;
                }
            }
            // If we’re here, it means we didn't match the triple pattern.
            // So just push instr1 and keep going. But also we need to move i
            // up to at least i2 - 1, so that the for-loop continues from i2 next time.
            newInstrs.push(instr1);
            // Also push any neutral instructions between i+1 and i2
            pushAllBetween(instrs, i + 1, i2, newInstrs);
            // We'll let the for-loop increment i normally, but we need
            // to manually push `instrs[i2]` next iteration or let the loop handle it.
            i = i2 - 1;
        }
        block.instructions = newInstrs;
        return changed;
    }
}
/**
 * Rewrite a StoreLocalInstruction's 'value' with a new place.
 * We do this by building a small rewrite map and calling `rewriteInstruction()`.
 */
function rewriteStoreSource(storeInstr, newValue) {
    const oldValueId = storeInstr.value.identifier;
    const rewriteMap = new Map([[oldValueId, newValue]]);
    return storeInstr.rewriteInstruction(rewriteMap);
}
/**
 * Returns true if the instruction is something we consider "neutral," i.e.,
 * it doesn't affect the triple (store → load → store) detection.
 */
function isNeutral(instr) {
    return (instr.constructor.name === "BindingIdentifierInstruction" ||
        instr.constructor.name === "LiteralInstruction");
}
/**
 * Finds the next non-neutral instruction index, starting at `startIndex`.
 * Returns -1 if none is found.
 */
function findNextMeaningful(instrs, startIndex) {
    for (let j = startIndex; j < instrs.length; j++) {
        if (!isNeutral(instrs[j])) {
            return j;
        }
    }
    return -1;
}
/**
 * Pushes all instructions from [start, end) that are neutral into `out`.
 * This ensures we don't lose track of them while we're skipping around.
 */
function pushAllBetween(instrs, start, end, out) {
    for (let k = start; k < end && k < instrs.length; k++) {
        if (isNeutral(instrs[k])) {
            out.push(instrs[k]);
        }
    }
}

export { LoadStoreForwardingPass };
//# sourceMappingURL=LoadStoreForwardingPass.js.map
