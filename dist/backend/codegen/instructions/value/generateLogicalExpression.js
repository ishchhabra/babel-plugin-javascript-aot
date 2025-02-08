import * as t from '@babel/types';

function generateLogicalExpressionInstruction(instruction, generator) {
    const left = generator.places.get(instruction.left.id);
    if (left === undefined) {
        throw new Error(`Place ${instruction.left.id} not found`);
    }
    const right = generator.places.get(instruction.right.id);
    if (right === undefined) {
        throw new Error(`Place ${instruction.right.id} not found`);
    }
    t.assertExpression(left);
    t.assertExpression(right);
    const node = t.logicalExpression(instruction.operator, left, right);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateLogicalExpressionInstruction };
//# sourceMappingURL=generateLogicalExpression.js.map
