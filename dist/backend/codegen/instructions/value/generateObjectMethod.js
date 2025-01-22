import * as t from '@babel/types';
import { generateFunction } from '../../generateFunction.js';

function generateObjectMethodInstruction(instruction, generator) {
    const key = generator.places.get(instruction.key.id);
    if (key === undefined) {
        throw new Error(`Place ${instruction.key.id} not found`);
    }
    t.assertExpression(key);
    const params = instruction.body.params.map((param) => {
        // Since this is the first time we're using param, it does not exist in the
        // places map. We need to create a new identifier for it.
        const identifier = t.identifier(param.identifier.name);
        generator.places.set(param.id, identifier);
        return identifier;
    });
    const body = generateFunction(instruction.body, generator);
    const node = t.objectMethod(instruction.kind, key, params, t.blockStatement(body), instruction.computed, instruction.generator, instruction.async);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateObjectMethodInstruction };
//# sourceMappingURL=generateObjectMethod.js.map
