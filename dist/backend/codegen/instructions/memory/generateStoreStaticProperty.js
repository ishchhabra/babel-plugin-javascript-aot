import * as t from '@babel/types';

/**
 * Generates the Babel AST for storing a value into an object property:
 * `object[property] = value`.
 *
 * We keep a separate `StoreStaticPropertyInstruction` (rather than reusing local
 * store instructions) because object property writes typically involve memory
 * and alias analysis that differs from local variable writes.
 */
function generateStoreStaticPropertyInstruction(instruction, generator) {
    const objectNode = generator.places.get(instruction.object.id);
    if (!objectNode) {
        throw new Error(`Place ${instruction.object.id} not found`);
    }
    t.assertExpression(objectNode);
    const valueNode = generator.places.get(instruction.value.id);
    if (!valueNode) {
        throw new Error(`Place ${instruction.value.id} not found`);
    }
    t.assertExpression(valueNode);
    let propertyNode;
    if (t.isValidIdentifier(instruction.property, true)) {
        propertyNode = t.identifier(instruction.property);
    }
    else {
        propertyNode = t.valueToNode(instruction.property);
    }
    const isComputed = !t.isIdentifier(propertyNode);
    const memberExpr = t.memberExpression(objectNode, propertyNode, isComputed);
    const node = t.assignmentExpression("=", memberExpr, valueNode);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateStoreStaticPropertyInstruction };
//# sourceMappingURL=generateStoreStaticProperty.js.map
