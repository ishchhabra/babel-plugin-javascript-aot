import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { MemberExpressionInstruction } from '../../../ir/instructions/value/MemberExpression.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildMemberExpression(nodePath, builder) {
    const objectPath = nodePath.get("object");
    const objectPlace = buildNode(objectPath, builder);
    if (objectPlace === undefined || Array.isArray(objectPlace)) {
        throw new Error("Member expression object must be a single place");
    }
    const propertyPath = nodePath.get("property");
    const propertyPlace = buildNode(propertyPath, builder);
    if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
        throw new Error("Member expression property must be a single place");
    }
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new MemberExpressionInstruction(instructionId, place, nodePath, objectPlace, propertyPlace, nodePath.node.computed));
    return place;
}

export { buildMemberExpression };
//# sourceMappingURL=buildMemberExpression.js.map
