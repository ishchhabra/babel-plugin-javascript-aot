import { createIdentifier, createPlace, createInstructionId } from '../../ir/utils.js';
import { SpreadElementInstruction } from '../../ir/instructions/SpreadElement.js';
import { buildNode } from './buildNode.js';

function buildSpreadElement(nodePath, functionBuilder, moduleBuilder) {
    const argumentPath = nodePath.get("argument");
    const argumentPlace = buildNode(argumentPath, functionBuilder, moduleBuilder);
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
        throw new Error("Spread element argument must be a single place");
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(new SpreadElementInstruction(instructionId, place, nodePath, argumentPlace));
    return place;
}

export { buildSpreadElement };
//# sourceMappingURL=buildSpreadElement.js.map
