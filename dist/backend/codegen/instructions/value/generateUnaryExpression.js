import * as t from '@babel/types';

function generateUnaryExpressionInstruction(instruction, generator) {
    const argument = generator.places.get(instruction.argument.id);
    t.assertExpression(argument);
    const node = t.unaryExpression(instruction.operator, argument);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateUnaryExpressionInstruction };
//# sourceMappingURL=generateUnaryExpression.js.map
