import * as t from '@babel/types';

function generateObjectExpressionInstruction(instruction, generator) {
    const properties = instruction.properties.map((property) => {
        const propertyNode = generator.places.get(property.id);
        if (propertyNode === undefined) {
            throw new Error(`Place ${property.id} not found`);
        }
        if (!t.isObjectProperty(propertyNode) && !t.isObjectMethod(propertyNode)) {
            throw new Error(`Unsupported property type: ${propertyNode?.type}`);
        }
        return propertyNode;
    });
    const node = t.objectExpression(properties);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateObjectExpressionInstruction };
//# sourceMappingURL=generateObjectExpression.js.map
