import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { BinaryExpressionInstruction } from '../../../ir/instructions/value/BinaryExpression.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildBinaryExpression(nodePath, functionBuilder, moduleBuilder) {
    const leftPath = nodePath.get("left");
    leftPath.assertExpression();
    const leftPlace = buildNode(leftPath, functionBuilder, moduleBuilder);
    if (leftPlace === undefined || Array.isArray(leftPlace)) {
        throw new Error("Binary expression left must be a single place");
    }
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Binary expression right must be a single place");
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    functionBuilder.currentBlock.instructions.push(new BinaryExpressionInstruction(instructionId, place, nodePath, nodePath.node.operator, leftPlace, rightPlace));
    return place;
}

export { buildBinaryExpression };
//# sourceMappingURL=buildBinaryExpression.js.map
