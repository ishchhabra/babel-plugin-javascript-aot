import * as t from '@babel/types';

function generateArrayExpressionInstruction(instruction, generator) {
    const elements = instruction.elements.map((element) => {
        const node = generator.places.get(element.id);
        if (node === undefined) {
            throw new Error(`Place ${element.id} not found`);
        }
        if (node === null || t.isSpreadElement(node)) {
            return node;
        }
        t.assertExpression(node);
        return node;
    });
    const node = t.arrayExpression(elements);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateArrayExpressionInstruction };
//# sourceMappingURL=generateArrayExpression.js.map
