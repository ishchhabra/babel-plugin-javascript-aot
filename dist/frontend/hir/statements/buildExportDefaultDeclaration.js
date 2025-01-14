import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { ExportDefaultDeclarationInstruction } from '../../../ir/instructions/module/ExportDefaultDeclaration.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildExportDefaultDeclaration(nodePath, builder) {
    const declarationPath = nodePath.get("declaration");
    const declarationPlace = buildNode(declarationPath, builder);
    if (declarationPlace === undefined || Array.isArray(declarationPlace)) {
        throw new Error("Export default declaration must be a single place");
    }
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    const instruction = new ExportDefaultDeclarationInstruction(instructionId, place, nodePath, declarationPlace);
    builder.currentBlock.instructions.push(instruction);
    builder.exportToInstructions.set("default", instruction);
    return place;
}

export { buildExportDefaultDeclaration };
//# sourceMappingURL=buildExportDefaultDeclaration.js.map
