import { makeInstructionId } from '../../ir/base/Instruction.js';
import { UnsupportedNodeInstruction } from '../../ir/instructions/UnsupportedNode.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';

function buildUnsupportedNode(nodePath, builder) {
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new UnsupportedNodeInstruction(instructionId, place, nodePath, nodePath.node));
    return place;
}

export { buildUnsupportedNode };
//# sourceMappingURL=buildUnsupportedNode.js.map
