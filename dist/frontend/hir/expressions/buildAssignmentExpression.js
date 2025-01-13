import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildAssignmentExpression(nodePath, builder) {
    const leftPath = nodePath.get("left");
    leftPath.assertIdentifier();
    const declarationId = builder.getDeclarationId(leftPath.node.name, nodePath);
    if (declarationId === undefined) {
        throw new Error(`Variable accessed before declaration: ${leftPath.node.name}`);
    }
    const lvalIdentifier = createIdentifier(builder.environment, declarationId);
    const lvalPlace = createPlace(lvalIdentifier, builder.environment);
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, builder);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Assignment expression right must be a single place");
    }
    // Create a new place for this assignment using the same declarationId
    const identifier = createIdentifier(builder.environment, declarationId);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.registerDeclarationPlace(declarationId, lvalPlace);
    builder.currentBlock.instructions.push(new StoreLocalInstruction(instructionId, place, nodePath, lvalPlace, rightPlace, "const"));
    return place;
}

export { buildAssignmentExpression };
//# sourceMappingURL=buildAssignmentExpression.js.map
