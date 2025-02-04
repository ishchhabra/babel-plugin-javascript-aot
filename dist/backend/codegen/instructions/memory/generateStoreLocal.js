import * as t from '@babel/types';

function generateStoreLocalInstruction(instruction, generator) {
    let lval = generator.places.get(instruction.lval.id);
    // TODO: Use BindingIdentifierInstruction to generate instead of this hack.
    // Since this is the first time we're using lval, it does not exist in the
    // places map. We need to create a new identifier for it.
    lval ??= t.identifier(instruction.lval.identifier.name);
    generator.places.set(instruction.lval.id, lval);
    t.assertLVal(lval);
    const value = generator.places.get(instruction.value.id);
    t.assertExpression(value);
    const node = t.variableDeclaration(instruction.type, [
        t.variableDeclarator(lval, value),
    ]);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateStoreLocalInstruction };
//# sourceMappingURL=generateStoreLocal.js.map
