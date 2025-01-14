import { makeInstructionId } from '../../ir/base/Instruction.js';
import { ExportSpecifierInstruction } from '../../ir/instructions/module/ExportSpecifier.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { buildNode } from './buildNode.js';

function buildExportSpecifier(nodePath, builder) {
    const localPath = nodePath.get("local");
    const localPlace = buildNode(localPath, builder);
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
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    const instruction = new ExportSpecifierInstruction(instructionId, place, nodePath, localPlace, exportedName);
    builder.currentBlock.instructions.push(instruction);
    builder.exportToInstructions.set(exportedName, instruction);
    return place;
}

export { buildExportSpecifier };
//# sourceMappingURL=buildExportSpecifier.js.map
