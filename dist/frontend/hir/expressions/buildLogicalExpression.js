import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { LogicalExpressionInstruction } from '../../../ir/instructions/value/LogicalExpression.js';
import { buildNode } from '../buildNode.js';

function buildLogicalExpression(nodePath, functionBuilder, moduleBuilder) {
    const leftPath = nodePath.get("left");
    const leftPlace = buildNode(leftPath, functionBuilder, moduleBuilder);
    if (leftPlace === undefined || Array.isArray(leftPlace)) {
        throw new Error("Logical expression left must be a single place");
    }
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Logical expression right must be a single place");
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    functionBuilder.currentBlock.instructions.push(new LogicalExpressionInstruction(instructionId, place, nodePath, nodePath.node.operator, leftPlace, rightPlace));
    return place;
}

export { buildLogicalExpression };
//# sourceMappingURL=buildLogicalExpression.js.map
