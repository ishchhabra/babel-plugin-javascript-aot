import * as t from '@babel/types';
import { generateFunction } from '../../generateFunction.js';

function generateFunctionDeclarationInstruction(instruction, generator) {
    // Since this is the first time we're using param, it does not exist in the
    // places map. We need to create a new identifier for it.
    const paramNodes = instruction.params.map((param) => {
        const identifier = t.identifier(param.identifier.name);
        generator.places.set(param.id, identifier);
        return identifier;
    });
    const idNode = generator.places.get(instruction.place.id);
    t.assertIdentifier(idNode);
    const body = generateFunction(instruction.functionIR, generator);
    const node = t.functionDeclaration(idNode, paramNodes, t.blockStatement(body), instruction.generator, instruction.async);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateFunctionDeclarationInstruction };
//# sourceMappingURL=generateFunctionDeclaration.js.map
