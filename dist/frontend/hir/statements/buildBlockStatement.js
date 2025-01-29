import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { JumpTerminal } from '../../../ir/core/Terminal.js';
import { createBlock } from '../../../ir/utils.js';
import { buildBindings } from '../bindings/buildBindings.js';
import { buildNode } from '../buildNode.js';

function buildBlockStatement(nodePath, functionBuilder, moduleBuilder, environment) {
    const currentBlock = functionBuilder.currentBlock;
    const block = createBlock(functionBuilder.environment);
    functionBuilder.blocks.set(block.id, block);
    functionBuilder.currentBlock = block;
    buildBindings(nodePath, functionBuilder, environment);
    const body = nodePath.get("body");
    for (const statementPath of body) {
        buildNode(statementPath, functionBuilder, moduleBuilder, environment);
    }
    currentBlock.terminal = new JumpTerminal(makeInstructionId(functionBuilder.environment.nextInstructionId++), block.id);
    return undefined;
}

export { buildBlockStatement };
//# sourceMappingURL=buildBlockStatement.js.map
