import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildAssignmentExpression(nodePath, functionBuilder, moduleBuilder) {
    const leftPath = nodePath.get("left");
    leftPath.assertIdentifier();
    const declarationId = functionBuilder.getDeclarationId(leftPath.node.name, nodePath);
    if (declarationId === undefined) {
        throw new Error(`Variable accessed before declaration: ${leftPath.node.name}`);
    }
    const lvalIdentifier = createIdentifier(functionBuilder.environment, declarationId);
    const lvalPlace = createPlace(lvalIdentifier, functionBuilder.environment);
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Assignment expression right must be a single place");
    }
    // Create a new place for this assignment using the same declarationId
    const identifier = createIdentifier(functionBuilder.environment, declarationId);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    functionBuilder.registerDeclarationPlace(declarationId, lvalPlace);
    functionBuilder.currentBlock.instructions.push(new StoreLocalInstruction(instructionId, place, nodePath, lvalPlace, rightPlace, "const"));
    return place;
}

export { buildAssignmentExpression };
//# sourceMappingURL=buildAssignmentExpression.js.map
