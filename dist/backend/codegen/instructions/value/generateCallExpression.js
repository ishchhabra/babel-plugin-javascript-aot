import * as t from '@babel/types';

function generateCallExpression(instruction, generator) {
    const callee = generator.places.get(instruction.callee.id);
    if (callee === undefined) {
        throw new Error(`Place ${instruction.callee.id} not found`);
    }
    t.assertExpression(callee);
    const args = instruction.args.map((argument) => {
        const node = generator.places.get(argument.id);
        if (node === undefined) {
            throw new Error(`Place ${argument.id} not found`);
        }
        t.assertExpression(node);
        return node;
    });
    const node = t.callExpression(callee, args);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateCallExpression };
//# sourceMappingURL=generateCallExpression.js.map
