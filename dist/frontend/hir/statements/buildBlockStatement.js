import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { JumpTerminal } from '../../../ir/core/Terminal.js';
import { createBlock } from '../../../ir/utils.js';
import { buildBindings } from '../bindings/buildBindings.js';
import { buildNode } from '../buildNode.js';

function buildBlockStatement(nodePath, builder) {
    const currentBlock = builder.currentBlock;
    const block = createBlock(builder.environment);
    builder.blocks.set(block.id, block);
    builder.currentBlock = block;
    buildBindings(nodePath, builder);
    const body = nodePath.get("body");
    for (const statementPath of body) {
        buildNode(statementPath, builder);
    }
    currentBlock.terminal = new JumpTerminal(makeInstructionId(builder.environment.nextInstructionId++), block.id);
    return undefined;
}

export { buildBlockStatement };
//# sourceMappingURL=buildBlockStatement.js.map
