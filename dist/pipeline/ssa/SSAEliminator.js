import { makeInstructionId } from '../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { ExpressionStatementInstruction } from '../../ir/instructions/ExpressionStatement.js';
import { CopyInstruction } from '../../ir/instructions/memory/CopyInstruction.js';
import { LoadLocalInstruction } from '../../ir/instructions/memory/LoadLocal.js';
import { StoreLocalInstruction } from '../../ir/instructions/memory/StoreLocal.js';

/**
 * Eliminates the phis from the HIR by inserting copy instructions.
 */
class SSAEliminator {
    functionIR;
    moduleIR;
    phis;
    constructor(functionIR, moduleIR, phis) {
        this.functionIR = functionIR;
        this.moduleIR = moduleIR;
        this.phis = phis;
    }
    eliminate() {
        for (const phi of this.phis) {
            // Ignore phis with only one operand since they are redundant.
            if (phi.operands.size <= 1) {
                continue;
            }
            this.#insertPhiDeclaration(phi);
            // NOTE: We need to replace phi usages before inserting copies, otherwise
            // the copies will be rewritten as well, making it `phi = phi`.
            this.#replacePhiUsages(phi);
            this.#insertPhiCopies(phi);
        }
        return { blocks: this.functionIR.blocks };
    }
    #insertPhiDeclaration(phi) {
        const declaration = this.moduleIR.environment.declToPlaces.get(phi.declarationId)?.[0];
        if (declaration === undefined) {
            throw new Error(`Declaration place not found for ${phi.declarationId}`);
        }
        const declarationBlock = this.functionIR.blocks.get(declaration.blockId);
        if (declarationBlock === undefined) {
            throw new Error(`Declaration block not found for ${phi.declarationId}`);
        }
        const identifier = createIdentifier(this.moduleIR.environment, phi.place.identifier.declarationId);
        const place = createPlace(identifier, this.moduleIR.environment);
        const instructionId = makeInstructionId(this.moduleIR.environment.nextInstructionId++);
        const instruction = new StoreLocalInstruction(instructionId, place, undefined, phi.place, declaration.place, "let");
        declarationBlock.instructions.push(instruction);
    }
    #insertPhiCopies(phi) {
        for (const [blockId, place] of phi.operands) {
            const block = this.functionIR.blocks.get(blockId);
            if (block === undefined) {
                throw new Error(`Block not found for ${blockId}`);
            }
            // Step 1: Load the value of the variable into a place.
            const loadId = makeInstructionId(this.moduleIR.environment.nextInstructionId++);
            const loadPlace = createPlace(createIdentifier(this.moduleIR.environment), this.moduleIR.environment);
            block.instructions.push(new LoadLocalInstruction(loadId, loadPlace, undefined, place));
            // Step 2: Create a copy instruction using the loaded value.
            const copyId = makeInstructionId(this.moduleIR.environment.nextInstructionId++);
            const copyPlace = createPlace(createIdentifier(this.moduleIR.environment, phi.place.identifier.declarationId), this.moduleIR.environment);
            block.instructions.push(new CopyInstruction(copyId, copyPlace, undefined, phi.place, loadPlace));
            // Step 3: Wrap the copy instruction in an expression statement.
            const exprId = makeInstructionId(this.moduleIR.environment.nextInstructionId++);
            const exprPlace = createPlace(createIdentifier(this.moduleIR.environment), this.moduleIR.environment);
            block.instructions.push(new ExpressionStatementInstruction(exprId, exprPlace, undefined, copyPlace));
        }
    }
    #replacePhiUsages(phi) {
        const values = new Map(Array.from(phi.operands.values()).map((place) => [
            place.identifier,
            phi.place,
        ]));
        for (const [blockId, block] of this.functionIR.blocks) {
            const dominators = this.functionIR.dominators.get(blockId);
            if (!dominators.has(phi.blockId)) {
                continue;
            }
            block.instructions = block.instructions.map((instruction) => instruction.rewriteInstruction(values));
        }
    }
}

export { SSAEliminator };
//# sourceMappingURL=SSAEliminator.js.map
