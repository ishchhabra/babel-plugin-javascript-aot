import * as t from '@babel/types';

function generateArrayPatternInstruction(instruction, generator) {
    const elements = instruction.elements.map((element) => {
        const node = generator.places.get(element.id);
        if (node === undefined) {
            throw new Error(`Place ${element.id} not found`);
        }
        t.assertLVal(node);
        return node;
    });
    const node = t.arrayPattern(elements);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateArrayPatternInstruction };
//# sourceMappingURL=generateArrayPattern.js.map