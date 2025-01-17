import { makeInstructionId } from '../../ir/base/Instruction.js';
import { HoleInstruction } from '../../ir/instructions/value/Hole.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';

function buildHole(expressionPath, builder) {
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new HoleInstruction(instructionId, place, expressionPath));
    return place;
}

export { buildHole };
//# sourceMappingURL=buildHole.js.map
