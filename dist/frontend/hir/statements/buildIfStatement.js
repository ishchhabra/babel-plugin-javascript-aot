import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { JumpTerminal, BranchTerminal } from '../../../ir/core/Terminal.js';
import { createBlock } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildIfStatement(nodePath, builder) {
    const testPath = nodePath.get("test");
    const testPlace = buildNode(testPath, builder);
    if (testPlace === undefined || Array.isArray(testPlace)) {
        throw new Error("If statement test must be a single place");
    }
    const currentBlock = builder.currentBlock;
    // Create the join block.
    const joinBlock = createBlock(builder.environment);
    builder.blocks.set(joinBlock.id, joinBlock);
    // Build the consequent block
    const consequentPath = nodePath.get("consequent");
    const consequentBlock = createBlock(builder.environment);
    builder.blocks.set(consequentBlock.id, consequentBlock);
    builder.currentBlock = consequentBlock;
    buildNode(consequentPath, builder);
    // After building the consequent block, we need to set the terminal
    // from the last block to the join block.
    builder.currentBlock.terminal = new JumpTerminal(makeInstructionId(builder.environment.nextInstructionId++), joinBlock.id);
    // Build the alternate block
    const alternatePath = nodePath.get("alternate");
    let alternateBlock = currentBlock;
    if (alternatePath.hasNode()) {
        alternateBlock = createBlock(builder.environment);
        builder.blocks.set(alternateBlock.id, alternateBlock);
        builder.currentBlock = alternateBlock;
        buildNode(alternatePath, builder);
    }
    // After building the alternate block, we need to set the terminal
    // from the last block to the join block.
    builder.currentBlock.terminal = new JumpTerminal(makeInstructionId(builder.environment.nextInstructionId++), joinBlock.id);
    // Set branch terminal for the current block.
    currentBlock.terminal = new BranchTerminal(makeInstructionId(builder.environment.nextInstructionId++), testPlace, consequentBlock.id, alternateBlock.id, joinBlock.id);
    builder.currentBlock = joinBlock;
    return undefined;
}

export { buildIfStatement };
//# sourceMappingURL=buildIfStatement.js.map
