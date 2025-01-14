import { createRequire } from 'module';
import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { ImportDeclarationInstruction } from '../../../ir/instructions/module/ImportDeclaration.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildImportDeclaration(nodePath, builder) {
    const sourcePath = nodePath.get("source");
    const sourceValue = sourcePath.node.value;
    const resolvedSourceValue = resolveModulePath(sourceValue, builder.path);
    const specifiersPath = nodePath.get("specifiers");
    const specifierPlaces = specifiersPath.map((specifierPath) => {
        const importSpecifierPlace = buildNode(specifierPath, builder);
        if (importSpecifierPlace === undefined ||
            Array.isArray(importSpecifierPlace)) {
            throw new Error(`Import specifier must be a single place`);
        }
        return importSpecifierPlace;
    });
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    builder.currentBlock.instructions.push(new ImportDeclarationInstruction(makeInstructionId(builder.environment.nextInstructionId++), place, nodePath, sourceValue, resolvedSourceValue, specifierPlaces));
    builder.importToPlaces.set(resolvedSourceValue, place);
    return place;
}
function resolveModulePath(importPath, path) {
    const require = createRequire(path);
    return require.resolve(importPath);
}

export { buildImportDeclaration };
//# sourceMappingURL=buildImportDeclaration.js.map
