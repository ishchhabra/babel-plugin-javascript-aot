import * as t from '@babel/types';

function generateExpressionStatementInstruction(instruction, generator) {
    const expression = generator.places.get(instruction.expression.id);
    if (expression === undefined) {
        throw new Error(`Place ${instruction.expression.id} not found`);
    }
    t.assertExpression(expression);
    const node = t.expressionStatement(expression);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateExpressionStatementInstruction };
//# sourceMappingURL=generateExpressionStatement.js.map
