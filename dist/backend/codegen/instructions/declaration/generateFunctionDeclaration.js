import * as t from '@babel/types';
import { generateFunction } from '../../generateFunction.js';

function generateFunctionDeclarationInstruction(instruction, generator) {
    const idNode = generator.places.get(instruction.place.id);
    t.assertIdentifier(idNode);
    const { params, statements } = generateFunction(instruction.functionIR, generator);
    const node = t.functionDeclaration(idNode, params, t.blockStatement(statements), instruction.generator, instruction.async);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateFunctionDeclarationInstruction };
//# sourceMappingURL=generateFunctionDeclaration.js.map
