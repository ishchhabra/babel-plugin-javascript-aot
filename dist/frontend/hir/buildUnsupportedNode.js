import { createInstructionId } from '../../ir/utils.js';
import { UnsupportedNodeInstruction } from '../../ir/instructions/UnsupportedNode.js';

function buildUnsupportedNode(nodePath, functionBuilder, environment) {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    functionBuilder.addInstruction(new UnsupportedNodeInstruction(instructionId, place, nodePath, nodePath.node));
    return place;
}

export { buildUnsupportedNode };
//# sourceMappingURL=buildUnsupportedNode.js.map
