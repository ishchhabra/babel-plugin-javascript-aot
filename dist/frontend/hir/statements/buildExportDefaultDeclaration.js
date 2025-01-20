import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { ExportDefaultDeclarationInstruction } from '../../../ir/instructions/module/ExportDefaultDeclaration.js';
import { buildNode } from '../buildNode.js';

function buildExportDefaultDeclaration(nodePath, functionBuilder, moduleBuilder) {
    const declarationPath = nodePath.get("declaration");
    const declarationPlace = buildNode(declarationPath, functionBuilder, moduleBuilder);
    if (declarationPlace === undefined || Array.isArray(declarationPlace)) {
        throw new Error("Export default declaration must be a single place");
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    const instruction = new ExportDefaultDeclarationInstruction(instructionId, place, nodePath, declarationPlace);
    functionBuilder.currentBlock.instructions.push(instruction);
    moduleBuilder.exportToInstructions.set("default", instruction);
    return place;
}

export { buildExportDefaultDeclaration };
//# sourceMappingURL=buildExportDefaultDeclaration.js.map
