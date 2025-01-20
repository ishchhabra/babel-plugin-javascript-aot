import { createIdentifier, createPlace, createInstructionId } from '../../ir/utils.js';
import { ExportSpecifierInstruction } from '../../ir/instructions/module/ExportSpecifier.js';
import { buildNode } from './buildNode.js';

function buildExportSpecifier(nodePath, functionBuilder, moduleBuilder) {
    const localPath = nodePath.get("local");
    const localPlace = buildNode(localPath, functionBuilder, moduleBuilder);
    if (localPlace === undefined || Array.isArray(localPlace)) {
        throw new Error("Export specifier local must be a single place");
    }
    const exportedPath = nodePath.get("exported") ?? localPath;
    let exportedName;
    if (exportedPath.isIdentifier()) {
        exportedName = exportedPath.node.name;
    }
    else if (exportedPath.isStringLiteral()) {
        exportedName = exportedPath.node.value;
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    const instruction = new ExportSpecifierInstruction(instructionId, place, nodePath, localPlace, exportedName);
    functionBuilder.currentBlock.instructions.push(instruction);
    moduleBuilder.exportToInstructions.set(exportedName, instruction);
    return place;
}

export { buildExportSpecifier };
//# sourceMappingURL=buildExportSpecifier.js.map
