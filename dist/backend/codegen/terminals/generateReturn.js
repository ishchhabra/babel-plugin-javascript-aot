import * as t from '@babel/types';

function generateReturnTerminal(terminal, generator) {
    const value = generator.places.get(terminal.value.id);
    if (value === undefined) {
        throw new Error(`Place ${terminal.value.id} not found`);
    }
    t.assertExpression(value);
    return [t.returnStatement(value)];
}

export { generateReturnTerminal };
//# sourceMappingURL=generateReturn.js.map
