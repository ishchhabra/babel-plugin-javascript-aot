import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { ExportNamedDeclarationInstruction } from '../../../ir/instructions/module/ExportNamedDeclaration.js';
import { buildNode } from '../buildNode.js';

function buildExportNamedDeclaration(nodePath, functionBuilder, moduleBuilder) {
    const declarationPath = nodePath.get("declaration");
    const specifiersPath = nodePath.get("specifiers");
    // An export can have either declaration or specifiers, but not both.
    if (declarationPath.hasNode()) {
        let declarationPlace = buildNode(declarationPath, functionBuilder, moduleBuilder);
        if (Array.isArray(declarationPlace)) {
            // TODO: Iterate over all declaration places to split them into multiple instructions.
            // Example:
            //   export const a = 1, b = 2;
            //   =>
            //   export const a = 1;
            //   export const b = 2;
            declarationPlace = declarationPlace[0];
        }
        const identifier = createIdentifier(functionBuilder.environment);
        const place = createPlace(identifier, functionBuilder.environment);
        const instruction = new ExportNamedDeclarationInstruction(makeInstructionId(functionBuilder.environment.nextInstructionId++), place, nodePath, [], declarationPlace);
        functionBuilder.addInstruction(instruction);
        moduleBuilder.exports.set(identifier.name, {
            instruction,
            declaration: functionBuilder.getDeclarationInstruction(declarationPlace.identifier.declarationId),
        });
        return place;
    }
    else {
        const exportSpecifierPlaces = specifiersPath.map((specifierPath) => {
            const exportSpecifierPlace = buildNode(specifierPath, functionBuilder, moduleBuilder);
            if (exportSpecifierPlace === undefined ||
                Array.isArray(exportSpecifierPlace)) {
                throw new Error(`Export specifier must be a single place`);
            }
            return exportSpecifierPlace;
        });
        const identifier = createIdentifier(functionBuilder.environment);
        const place = createPlace(identifier, functionBuilder.environment);
        const instruction = new ExportNamedDeclarationInstruction(makeInstructionId(functionBuilder.environment.nextInstructionId++), place, nodePath, exportSpecifierPlaces, undefined);
        functionBuilder.addInstruction(instruction);
        return place;
    }
}

export { buildExportNamedDeclaration };
//# sourceMappingURL=buildExportNamedDeclaration.js.map
