import { ImportSpecifierInstruction } from '../../ir/instructions/module/ImportSpecifier.js';
import { createIdentifier, createPlace, createInstructionId } from '../../ir/utils.js';
import { buildNode } from './buildNode.js';

function buildImportSpecifier(nodePath, functionBuilder, moduleBuilder) {
    const importedPath = nodePath.get("imported");
    const importedPlace = buildNode(importedPath, functionBuilder, moduleBuilder);
    const localPath = nodePath.get("local");
    const localPlace = localPath.hasNode()
        ? buildNode(localPath, functionBuilder, moduleBuilder)
        : undefined;
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    functionBuilder.currentBlock.instructions.push(new ImportSpecifierInstruction(createInstructionId(functionBuilder.environment), place, nodePath, importedPlace, localPlace));
    return place;
}

export { buildImportSpecifier };
//# sourceMappingURL=buildImportSpecifier.js.map
