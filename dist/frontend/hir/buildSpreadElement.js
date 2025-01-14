import { makeInstructionId } from '../../ir/base/Instruction.js';
import { SpreadElementInstruction } from '../../ir/instructions/SpreadElement.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { buildNode } from './buildNode.js';

function buildSpreadElement(nodePath, builder) {
    const argumentPath = nodePath.get("argument");
    const argumentPlace = buildNode(argumentPath, builder);
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
        throw new Error("Spread element argument must be a single place");
    }
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new SpreadElementInstruction(instructionId, place, nodePath, argumentPlace));
    return place;
}

export { buildSpreadElement };
//# sourceMappingURL=buildSpreadElement.js.map
