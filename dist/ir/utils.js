import { makeInstructionId } from './base/Instruction.js';
import { makeBlockId, BasicBlock } from './core/Block.js';
import 'lodash-es';

function createBlock(environment) {
    const blockId = makeBlockId(environment.nextBlockId++);
    return new BasicBlock(blockId, [], undefined);
}
function createInstructionId(environment) {
    return makeInstructionId(environment.nextInstructionId++);
}

export { createBlock, createInstructionId };
//# sourceMappingURL=utils.js.map
