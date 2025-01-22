import * as t from '@babel/types';

function generateImportSpecifierInstruction(instruction, generator) {
    if (instruction.imported === "default") {
        return generateImportDefaultSpecifier(instruction, generator);
    }
    else if (instruction.imported === "*") {
        return generateImportNamespaceSpecifier(instruction, generator);
    }
    else {
        return generateImportSpecifier(instruction, generator);
    }
}
function generateImportDefaultSpecifier(instruction, generator) {
    const local = t.identifier(instruction.local);
    const node = t.importDefaultSpecifier(local);
    generator.places.set(instruction.place.id, node);
    return node;
}
function generateImportNamespaceSpecifier(instruction, generator) {
    const local = t.identifier(instruction.local);
    const node = t.importNamespaceSpecifier(local);
    generator.places.set(instruction.place.id, node);
    return node;
}
function generateImportSpecifier(instruction, generator) {
    const local = t.identifier(instruction.local);
    const imported = t.identifier(instruction.imported);
    const node = t.importSpecifier(local, imported);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateImportSpecifierInstruction };
//# sourceMappingURL=generateImportSpecifier.js.map
