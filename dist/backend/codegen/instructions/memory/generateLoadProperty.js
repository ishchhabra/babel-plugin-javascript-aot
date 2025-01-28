import * as t from '@babel/types';

function generateLoadPropertyInstruction(instruction, generator) {
    const object = generator.places.get(instruction.object.id);
    if (object === undefined) {
        throw new Error(`Place ${instruction.object.id} not found`);
    }
    t.assertExpression(object);
    if (t.isValidIdentifier(instruction.property, true)) {
        const property = t.identifier(instruction.property);
        const node = t.memberExpression(object, property);
        generator.places.set(instruction.place.id, node);
        return node;
    }
    const property = t.valueToNode(instruction.property);
    const node = t.memberExpression(object, property, true);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateLoadPropertyInstruction };
//# sourceMappingURL=generateLoadProperty.js.map
