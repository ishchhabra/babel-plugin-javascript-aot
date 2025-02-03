import * as t from '@babel/types';

function generateAssignmentPatternInstruction(instruction, generator) {
    const left = generator.places.get(instruction.left.id);
    if (left === undefined) {
        throw new Error(`Place ${instruction.left.id} not found`);
    }
    const right = generator.places.get(instruction.right.id);
    if (right === undefined) {
        throw new Error(`Place ${instruction.right.id} not found`);
    }
    t.assertExpression(right);
    const node = t.assignmentPattern(left, right);
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateAssignmentPatternInstruction };
//# sourceMappingURL=generateAssignmentPattern.js.map
