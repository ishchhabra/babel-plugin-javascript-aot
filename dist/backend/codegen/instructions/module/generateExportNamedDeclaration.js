import * as t from '@babel/types';

function generateExportNamedDeclarationInstruction(instruction, generator) {
    if (instruction.declaration !== undefined) {
        const declaration = generator.places.get(instruction.declaration.id);
        if (declaration === undefined) {
            throw new Error(`Place ${instruction.declaration.id} not found`);
        }
        t.assertDeclaration(declaration);
        const node = t.exportNamedDeclaration(declaration, []);
        generator.places.set(instruction.place.id, node);
        return node;
    }
    const specifiers = instruction.specifiers.map((specifier) => {
        const node = generator.places.get(specifier.id);
        if (node === undefined) {
            throw new Error(`Place ${specifier.id} not found`);
        }
        t.assertExportSpecifier(node);
        return node;
    });
    const node = t.exportNamedDeclaration(null, specifiers);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateExportNamedDeclarationInstruction };
//# sourceMappingURL=generateExportNamedDeclaration.js.map
