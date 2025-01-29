import { createInstructionId } from '../../ir/utils.js';
import { HoleInstruction } from '../../ir/instructions/value/Hole.js';

function buildHole(expressionPath, builder, environment) {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    builder.addInstruction(new HoleInstruction(instructionId, place, expressionPath));
    return place;
}

export { buildHole };
//# sourceMappingURL=buildHole.js.map
