import { HoleInstruction } from '../../ir/instructions/value/Hole.js';
import 'lodash-es';

function buildHole(expressionPath, builder, environment) {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(HoleInstruction, place, expressionPath);
    builder.addInstruction(instruction);
    return place;
}

export { buildHole };
//# sourceMappingURL=buildHole.js.map
