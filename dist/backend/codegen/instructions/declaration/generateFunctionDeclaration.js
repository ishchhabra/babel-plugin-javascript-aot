import * as t from '@babel/types';
import { generateBlock } from '../../generateBlock.js';

function generateFunctionDeclarationInstruction(instruction, generator) {
    // Since this is the first time we're using param, it does not exist in the
    // places map. We need to create a new identifier for it.
    const paramNodes = instruction.params.map((param) => {
        const identifier = t.identifier(param.identifier.name);
        generator.places.set(param.id, identifier);
        return identifier;
    });
    // Since this is the first time we're using the function name, it does not
    // exist in the places map. We need to create a new identifier for it.
    const idNode = t.identifier(instruction.place.identifier.name);
    generator.places.set(instruction.place.id, idNode);
    const body = generateBlock(instruction.body, generator);
    const node = t.functionDeclaration(idNode, paramNodes, t.blockStatement(body), instruction.generator, instruction.async);
    return node;
}

export { generateFunctionDeclarationInstruction };
//# sourceMappingURL=generateFunctionDeclaration.js.map
