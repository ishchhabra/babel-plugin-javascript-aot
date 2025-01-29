import { makeInstructionId } from '../../../ir/base/Instruction.js';
import 'lodash-es';
import { ExportDefaultDeclarationInstruction } from '../../../ir/instructions/module/ExportDefaultDeclaration.js';
import { buildNode } from '../buildNode.js';

function buildExportDefaultDeclaration(nodePath, functionBuilder, moduleBuilder, environment) {
    const declarationPath = nodePath.get("declaration");
    const declarationPlace = buildNode(declarationPath, functionBuilder, moduleBuilder, environment);
    if (declarationPlace === undefined || Array.isArray(declarationPlace)) {
        throw new Error("Export default declaration must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    const instruction = new ExportDefaultDeclarationInstruction(instructionId, place, nodePath, declarationPlace);
    functionBuilder.addInstruction(instruction);
    functionBuilder.environment.declToDeclInstrPlace.set(declarationPlace.identifier.declarationId, place.id);
    moduleBuilder.exports.set("default", {
        instruction,
        declaration: functionBuilder.getDeclarationInstruction(declarationPlace.identifier.declarationId),
    });
    return place;
}

export { buildExportDefaultDeclaration };
//# sourceMappingURL=buildExportDefaultDeclaration.js.map
