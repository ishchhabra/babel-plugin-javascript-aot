import * as t from '@babel/types';

function generateLoadPhiInstruction(instruction, generator) {
    console.warn(`Generating LoadPhiInstruction for ${instruction.value.identifier.name}`);
    const node = t.identifier(instruction.value.identifier.name);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateLoadPhiInstruction };
//# sourceMappingURL=generateLoadPhi.js.map
