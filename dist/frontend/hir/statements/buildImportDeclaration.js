import { createRequire } from 'module';
import { ImportDeclarationInstruction } from '../../../ir/instructions/module/ImportDeclaration.js';
import 'lodash-es';
import { buildImportSpecifier } from '../buildImportSpecifier.js';

function buildImportDeclaration(nodePath, functionBuilder, moduleBuilder, environment) {
    const sourcePath = nodePath.get("source");
    const sourceValue = sourcePath.node.value;
    const resolvedSourceValue = resolveModulePath(sourceValue, moduleBuilder.path);
    const specifiersPath = nodePath.get("specifiers");
    const specifierPlaces = specifiersPath.map((specifierPath) => {
        if (specifierPath.isImportNamespaceSpecifier()) {
            throw new Error("Import namespace specifier is not supported");
        }
        const importSpecifierPlace = buildImportSpecifier(specifierPath, nodePath, functionBuilder, moduleBuilder, environment);
        if (importSpecifierPlace === undefined ||
            Array.isArray(importSpecifierPlace)) {
            throw new Error(`Import specifier must be a single place`);
        }
        return importSpecifierPlace;
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ImportDeclarationInstruction, place, nodePath, sourceValue, resolvedSourceValue, specifierPlaces);
    functionBuilder.addInstruction(instruction);
    return place;
}
function resolveModulePath(importPath, path) {
    const require = createRequire(path);
    return require.resolve(importPath);
}

export { buildImportDeclaration };
//# sourceMappingURL=buildImportDeclaration.js.map
