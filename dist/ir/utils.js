import { makeInstructionId } from './base/Instruction.js';
import 'lodash-es';

function createInstructionId(environment) {
    return makeInstructionId(environment.nextInstructionId++);
}

export { createInstructionId };
//# sourceMappingURL=utils.js.map
