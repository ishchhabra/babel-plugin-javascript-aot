import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { ExportNamedDeclarationInstruction } from '../../../ir/instructions/module/ExportNamedDeclaration.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildExportNamedDeclaration(nodePath, builder) {
    const declarationPath = nodePath.get("declaration");
    const specifiersPath = nodePath.get("specifiers");
    // An export can have either declaration or specifiers, but not both.
    if (declarationPath.hasNode()) {
        let declarationPlace = buildNode(declarationPath, builder);
        if (Array.isArray(declarationPlace)) {
            // TODO: Iterate over all declaration places to split them into multiple instructions.
            // Example:
            //   export const a = 1, b = 2;
            //   =>
            //   export const a = 1;
            //   export const b = 2;
            declarationPlace = declarationPlace[0];
        }
        const identifier = createIdentifier(builder.environment);
        const place = createPlace(identifier, builder.environment);
        const instruction = new ExportNamedDeclarationInstruction(makeInstructionId(builder.environment.nextInstructionId++), place, nodePath, [], declarationPlace);
        builder.currentBlock.instructions.push(instruction);
        builder.exportToInstructions.set(identifier.name, instruction);
        return place;
    }
    else {
        const exportSpecifierPlaces = specifiersPath.map((specifierPath) => {
            const exportSpecifierPlace = buildNode(specifierPath, builder);
            if (exportSpecifierPlace === undefined ||
                Array.isArray(exportSpecifierPlace)) {
                throw new Error(`Export specifier must be a single place`);
            }
            return exportSpecifierPlace;
        });
        const identifier = createIdentifier(builder.environment);
        const place = createPlace(identifier, builder.environment);
        const instruction = new ExportNamedDeclarationInstruction(makeInstructionId(builder.environment.nextInstructionId++), place, nodePath, exportSpecifierPlaces, undefined);
        builder.currentBlock.instructions.push(instruction);
        builder.exportToInstructions.set(identifier.name, instruction);
        return place;
    }
}

export { buildExportNamedDeclaration };
//# sourceMappingURL=buildExportNamedDeclaration.js.map