import * as t from '@babel/types';

/**
 * Generates the Babel AST for storing a value into a dynamic object property:
 * `object[property] = value`.
 *
 * We keep a separate `StoreDynamicPropertyInstruction` (rather than reusing local
 * store instructions) because dynamic property writes typically involve memory
 * and alias analysis that differs from local variable writes.
 */
function generateStoreDynamicPropertyInstruction(instruction, generator) {
    const objectNode = generator.places.get(instruction.object.id);
    if (!objectNode) {
        throw new Error(`Place ${instruction.object.id} not found`);
    }
    t.assertExpression(objectNode);
    const propertyPlace = generator.places.get(instruction.property.id);
    if (!propertyPlace) {
        throw new Error(`Place ${instruction.property.id} not found`);
    }
    t.assertExpression(propertyPlace);
    const valueNode = generator.places.get(instruction.value.id);
    if (!valueNode) {
        throw new Error(`Place ${instruction.value.id} not found`);
    }
    t.assertExpression(valueNode);
    const memberExpr = t.memberExpression(objectNode, propertyPlace, true);
    const node = t.assignmentExpression("=", memberExpr, valueNode);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateStoreDynamicPropertyInstruction };
//# sourceMappingURL=generateStoreDynamicProperty.js.map
