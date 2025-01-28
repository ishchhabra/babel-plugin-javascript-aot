import * as t from '@babel/types';
import { generateFunction } from '../../generateFunction.js';

function generateFunctionExpressionInstruction(instruction, generator) {
    const idNode = instruction.identifier
        ? generator.places.get(instruction.identifier.id)
        : null;
    if (idNode !== null && !t.isIdentifier(idNode)) {
        throw new Error("Function expression identifier is not an identifier");
    }
    const { params, statements } = generateFunction(instruction.functionIR, generator);
    const node = t.functionExpression(idNode, params, t.blockStatement(statements), instruction.generator, instruction.async);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateFunctionExpressionInstruction };
//# sourceMappingURL=generateFunctionExpression.js.map
