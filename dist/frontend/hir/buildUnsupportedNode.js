import 'lodash-es';
import { UnsupportedNodeInstruction } from '../../ir/instructions/UnsupportedNode.js';

function buildUnsupportedNode(nodePath, functionBuilder, environment) {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(UnsupportedNodeInstruction, place, nodePath, nodePath.node);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildUnsupportedNode };
//# sourceMappingURL=buildUnsupportedNode.js.map
