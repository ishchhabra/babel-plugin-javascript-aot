import { LoadGlobalInstruction } from '../../ir/instructions/memory/LoadGlobal.js';
import 'lodash-es';
import { StorePropertyInstruction } from '../../ir/instructions/memory/StoreProperty.js';

const EXPORTS_PROPERTY_NAME = "exports";
/**
 * A pass that scans for and collects CommonJS exports in the IR, populating the
 * `moduleUnit.exports` map accordingly. This identifiers assignments to
 * `module.exports` (or `exports`) and  marks those properties or values
 * as module exports at the IR level.
 *
 *  Example:
 * ```js
 * // Original code:
 * module.exports.foo = 42;
 *
 * // After this pass, `moduleUnit.exports` will have an entry for "foo"
 * // referencing the IR node that produced the value 42.
 * ```
 */
class CommonJSExportCollectorPass {
    functionIR;
    moduleIR;
    constructor(functionIR, moduleIR) {
        this.functionIR = functionIR;
        this.moduleIR = moduleIR;
    }
    run() {
        for (const [blockId, block] of this.functionIR.blocks) {
            if (!this.isAlwaysExecutedBlock(blockId)) {
                continue;
            }
            for (const instruction of block.instructions) {
                if (!this.isModuleExportInstruction(instruction)) {
                    continue;
                }
                const declarationId = instruction.value.identifier.declarationId;
                const declarationInstructionId = this.moduleIR.environment.getDeclarationInstruction(declarationId);
                this.moduleIR.exports.set("default", {
                    instruction,
                    declaration: this.moduleIR.environment.instructions.get(declarationInstructionId),
                });
            }
        }
    }
    isModuleExportInstruction(instruction) {
        if (!(instruction instanceof StorePropertyInstruction) ||
            instruction.property !== EXPORTS_PROPERTY_NAME) {
            return false;
        }
        const objectPlace = instruction.object;
        const objectInstr = this.moduleIR.environment.placeToInstruction.get(objectPlace.id);
        if (!(objectInstr instanceof LoadGlobalInstruction) ||
            objectInstr.name !== "module") {
            return false;
        }
        return true;
    }
    isAlwaysExecutedBlock(blockId) {
        const exitBlockId = this.functionIR.exitBlockId;
        const exitDominators = this.functionIR.dominators.get(exitBlockId);
        return exitDominators.has(blockId);
    }
}

export { CommonJSExportCollectorPass };
//# sourceMappingURL=CommonJSExportCollectorPass.js.map
