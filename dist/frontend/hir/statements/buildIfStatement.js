import { JumpTerminal, BranchTerminal } from '../../../ir/core/Terminal.js';
import { createBlock, createInstructionId } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildIfStatement(nodePath, functionBuilder, moduleBuilder) {
    const testPath = nodePath.get("test");
    const testPlace = buildNode(testPath, functionBuilder, moduleBuilder);
    if (testPlace === undefined || Array.isArray(testPlace)) {
        throw new Error("If statement test must be a single place");
    }
    const currentBlock = functionBuilder.currentBlock;
    // Create the join block.
    const joinBlock = createBlock(functionBuilder.environment);
    functionBuilder.blocks.set(joinBlock.id, joinBlock);
    // Build the consequent block
    const consequentPath = nodePath.get("consequent");
    const consequentBlock = createBlock(functionBuilder.environment);
    functionBuilder.blocks.set(consequentBlock.id, consequentBlock);
    functionBuilder.currentBlock = consequentBlock;
    buildNode(consequentPath, functionBuilder, moduleBuilder);
    // After building the consequent block, we need to set the terminal
    // from the last block to the join block.
    functionBuilder.currentBlock.terminal = new JumpTerminal(createInstructionId(functionBuilder.environment), joinBlock.id);
    // Build the alternate block
    const alternatePath = nodePath.get("alternate");
    let alternateBlock = currentBlock;
    if (alternatePath.hasNode()) {
        alternateBlock = createBlock(functionBuilder.environment);
        functionBuilder.blocks.set(alternateBlock.id, alternateBlock);
        functionBuilder.currentBlock = alternateBlock;
        buildNode(alternatePath, functionBuilder, moduleBuilder);
    }
    // After building the alternate block, we need to set the terminal
    // from the last block to the join block.
    functionBuilder.currentBlock.terminal = new JumpTerminal(createInstructionId(functionBuilder.environment), joinBlock.id);
    // Set branch terminal for the current block.
    currentBlock.terminal = new BranchTerminal(createInstructionId(functionBuilder.environment), testPlace, consequentBlock.id, alternateBlock.id, joinBlock.id);
    functionBuilder.currentBlock = joinBlock;
    return undefined;
}

export { buildIfStatement };
//# sourceMappingURL=buildIfStatement.js.map
