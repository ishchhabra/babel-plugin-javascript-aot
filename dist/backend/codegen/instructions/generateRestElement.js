import * as t from '@babel/types';

function generateRestElementInstruction(instruction, generator) {
    const argument = generator.places.get(instruction.argument.id);
    if (argument === undefined) {
        throw new Error(`Place ${instruction.argument.id} not found`);
    }
    t.assertLVal(argument);
    const node = t.restElement(argument);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateRestElementInstruction };
//# sourceMappingURL=generateRestElement.js.map
