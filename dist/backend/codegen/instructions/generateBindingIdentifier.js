import * as t from '@babel/types';

function generateBindingIdentifierInstruction(instruction, generator) {
    const node = t.identifier(instruction.name);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateBindingIdentifierInstruction };
//# sourceMappingURL=generateBindingIdentifier.js.map
