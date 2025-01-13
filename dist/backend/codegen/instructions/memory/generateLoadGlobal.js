import * as t from '@babel/types';

function generateLoadGlobalInstruction(instruction, generator) {
    const node = t.identifier(instruction.name);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateLoadGlobalInstruction };
//# sourceMappingURL=generateLoadGlobal.js.map
