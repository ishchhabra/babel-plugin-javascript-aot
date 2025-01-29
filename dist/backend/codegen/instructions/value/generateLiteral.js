import * as t from '@babel/types';

function generateLiteralInstruction(instruction, generator) {
    const node = t.valueToNode(instruction.value);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateLiteralInstruction };
//# sourceMappingURL=generateLiteral.js.map
