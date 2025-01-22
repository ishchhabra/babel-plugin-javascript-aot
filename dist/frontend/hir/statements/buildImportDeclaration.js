import { createRequire } from 'module';
import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { ImportDeclarationInstruction } from '../../../ir/instructions/module/ImportDeclaration.js';
import { buildImportSpecifier } from '../buildImportSpecifier.js';

function buildImportDeclaration(nodePath, functionBuilder, moduleBuilder) {
    const sourcePath = nodePath.get("source");
    const sourceValue = sourcePath.node.value;
    const resolvedSourceValue = resolveModulePath(sourceValue, moduleBuilder.path);
    const specifiersPath = nodePath.get("specifiers");
    const specifierPlaces = specifiersPath.map((specifierPath) => {
        if (specifierPath.isImportNamespaceSpecifier()) {
            throw new Error("Import namespace specifier is not supported");
        }
        const importSpecifierPlace = buildImportSpecifier(specifierPath, nodePath, functionBuilder, moduleBuilder);
        if (importSpecifierPlace === undefined ||
            Array.isArray(importSpecifierPlace)) {
            throw new Error(`Import specifier must be a single place`);
        }
        return importSpecifierPlace;
    });
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instruction = new ImportDeclarationInstruction(createInstructionId(functionBuilder.environment), place, nodePath, sourceValue, resolvedSourceValue, specifierPlaces);
    functionBuilder.addInstruction(instruction);
    moduleBuilder.importToInstructions.set(resolvedSourceValue, instruction);
    return place;
}
function resolveModulePath(importPath, path) {
    const require = createRequire(path);
    return require.resolve(importPath);
}

export { buildImportDeclaration };
//# sourceMappingURL=buildImportDeclaration.js.map
