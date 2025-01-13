import { makeInstructionId } from '../../ir/base/Instruction.js';
import { ImportSpecifierInstruction } from '../../ir/instructions/module/ImportSpecifier.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { buildNode } from './buildNode.js';

function buildImportSpecifier(nodePath, builder) {
    const importedPath = nodePath.get("imported");
    const importedPlace = buildNode(importedPath, builder);
    const localPath = nodePath.get("local");
    const localPlace = localPath.hasNode()
        ? buildNode(localPath, builder)
        : undefined;
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    builder.currentBlock.instructions.push(new ImportSpecifierInstruction(makeInstructionId(builder.environment.nextInstructionId++), place, nodePath, importedPlace, localPlace));
    return place;
}

export { buildImportSpecifier };
//# sourceMappingURL=buildImportSpecifier.js.map
