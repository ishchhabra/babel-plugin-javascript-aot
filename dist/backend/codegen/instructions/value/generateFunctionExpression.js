import * as t from '@babel/types';
import { generateFunction } from '../../generateFunction.js';

function generateFunctionExpressionInstruction(instruction, generator) {
    const idNode = generator.places.get(instruction.identifier.id);
    t.assertIdentifier(idNode);
    const { params, statements } = generateFunction(instruction.functionIR, generator);
    const node = t.functionExpression(idNode, params, t.blockStatement(statements), instruction.generator, instruction.async);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateFunctionExpressionInstruction };
//# sourceMappingURL=generateFunctionExpression.js.map
