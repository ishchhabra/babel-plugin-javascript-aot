import * as t from '@babel/types';

function generateLoadLocalInstruction(instruction, generator) {
    const node = t.identifier(instruction.value.identifier.name);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateLoadLocalInstruction };
//# sourceMappingURL=generateLoadLocal.js.map
