import { BaseInstruction, BlockId, LoadGlobalInstruction } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { StorePropertyInstruction } from "../../ir/instructions/memory/StoreProperty";

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
export class CommonJSExportCollectorPass {
  constructor(
    private readonly functionIR: FunctionIR,
    private readonly moduleIR: ModuleIR,
  ) {}

  public run() {
    for (const [blockId, block] of this.functionIR.blocks) {
      if (!this.isAlwaysExecutedBlock(blockId)) {
        continue;
      }

      for (const instruction of block.instructions) {
        if (!this.isModuleExportInstruction(instruction)) {
          continue;
        }

        const declarationId = instruction.value.identifier.declarationId;
        const declarationInstructionId =
          this.moduleIR.environment.getDeclarationInstruction(declarationId)!;
        this.moduleIR.exports.set("default", {
          instruction,
          declaration: this.moduleIR.environment.instructions.get(
            declarationInstructionId,
          )!,
        });
      }
    }
  }

  private isModuleExportInstruction(
    instruction: BaseInstruction,
  ): instruction is StorePropertyInstruction {
    if (
      !(instruction instanceof StorePropertyInstruction) ||
      instruction.property !== EXPORTS_PROPERTY_NAME
    ) {
      return false;
    }

    const objectPlace = instruction.object;
    const objectInstr = this.moduleIR.environment.placeToInstruction.get(
      objectPlace.id,
    )!;

    if (
      !(objectInstr instanceof LoadGlobalInstruction) ||
      objectInstr.name !== "module"
    ) {
      return false;
    }

    return true;
  }

  private isAlwaysExecutedBlock(blockId: BlockId) {
    const exitBlockId = this.functionIR.exitBlockId;
    const exitDominators = this.functionIR.dominators.get(exitBlockId)!;
    return exitDominators.has(blockId);
  }
}
