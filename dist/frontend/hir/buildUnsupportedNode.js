import { UnsupportedNodeInstruction } from '../../ir/instructions/UnsupportedNode.js';
import { createIdentifier, createPlace, createInstructionId } from '../../ir/utils.js';

function buildUnsupportedNode(nodePath, functionBuilder) {
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.currentBlock.instructions.push(new UnsupportedNodeInstruction(instructionId, place, nodePath, nodePath.node));
    return place;
}

export { buildUnsupportedNode };
//# sourceMappingURL=buildUnsupportedNode.js.map
