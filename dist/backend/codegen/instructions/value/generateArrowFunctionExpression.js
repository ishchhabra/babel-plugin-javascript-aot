import * as t from '@babel/types';
import { generateFunction } from '../../generateFunction.js';

function generateArrowFunctionExpressionInstruction(instruction, generator) {
    const { params, statements } = generateFunction(instruction.functionIR, generator);
    let body = t.blockStatement(statements);
    if (instruction.expression) {
        const expressionInstr = instruction.functionIR.entryBlock.instructions.at(-1);
        const expression = generator.places.get(expressionInstr.place.id);
        t.assertExpression(expression);
        body = expression;
    }
    const node = t.arrowFunctionExpression(params, body, instruction.async);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateArrowFunctionExpressionInstruction };
//# sourceMappingURL=generateArrowFunctionExpression.js.map
