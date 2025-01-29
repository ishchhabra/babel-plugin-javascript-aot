import * as t from '@babel/types';
import { createRequire } from 'module';
import { createInstructionId } from '../../ir/utils.js';
import { ImportSpecifierInstruction } from '../../ir/instructions/module/ImportSpecifier.js';

function buildImportSpecifier(specifierNodePath, declarationNodePath, functionBuilder, moduleBuilder, environment) {
    const localName = getLocalName(specifierNodePath);
    const importedName = getImportedName(specifierNodePath);
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    functionBuilder.addInstruction(new ImportSpecifierInstruction(createInstructionId(functionBuilder.environment), place, specifierNodePath, localName, importedName));
    const source = declarationNodePath.node.source.value;
    moduleBuilder.globals.set(localName, {
        kind: "import",
        name: importedName,
        source: resolveModulePath(source, moduleBuilder.path),
    });
    return place;
}
function getLocalName(nodePath) {
    return nodePath.node.local.name;
}
function getImportedName(nodePath) {
    const node = nodePath.node;
    if (t.isImportDefaultSpecifier(node)) {
        return "default";
    }
    else if (t.isImportNamespaceSpecifier(node)) {
        return "*";
    }
    else {
        const importedNode = node.imported;
        if (t.isIdentifier(importedNode)) {
            return importedNode.name;
        }
        return importedNode.value;
    }
}
function resolveModulePath(importPath, path) {
    const require = createRequire(path);
    return require.resolve(importPath);
}

export { buildImportSpecifier };
//# sourceMappingURL=buildImportSpecifier.js.map
