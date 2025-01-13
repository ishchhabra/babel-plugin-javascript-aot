import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { BinaryExpressionInstruction } from '../../../ir/instructions/value/BinaryExpression.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildBinaryExpression(nodePath, builder) {
    const leftPath = nodePath.get("left");
    leftPath.assertExpression();
    const leftPlace = buildNode(leftPath, builder);
    if (leftPlace === undefined || Array.isArray(leftPlace)) {
        throw new Error("Binary expression left must be a single place");
    }
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, builder);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Binary expression right must be a single place");
    }
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new BinaryExpressionInstruction(instructionId, place, nodePath, nodePath.node.operator, leftPlace, rightPlace));
    return place;
}

export { buildBinaryExpression };
//# sourceMappingURL=buildBinaryExpression.js.map
