import { BranchTerminal, JumpTerminal } from '../../../ir/core/Terminal.js';
import { createInstructionId } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildWhileStatement(nodePath, functionBuilder, moduleBuilder, environment) {
    const currentBlock = functionBuilder.currentBlock;
    // Build the test block.
    const testPath = nodePath.get("test");
    const testBlock = environment.createBlock();
    functionBuilder.blocks.set(testBlock.id, testBlock);
    functionBuilder.currentBlock = testBlock;
    const testPlace = buildNode(testPath, functionBuilder, moduleBuilder, environment);
    if (testPlace === undefined || Array.isArray(testPlace)) {
        throw new Error("While statement test must be a single place");
    }
    const testBlockTerminus = functionBuilder.currentBlock;
    // Build the body block.
    const bodyPath = nodePath.get("body");
    const bodyBlock = environment.createBlock();
    functionBuilder.blocks.set(bodyBlock.id, bodyBlock);
    functionBuilder.currentBlock = bodyBlock;
    buildNode(bodyPath, functionBuilder, moduleBuilder, environment);
    const bodyBlockTerminus = functionBuilder.currentBlock;
    // Build the exit block.
    const exitBlock = environment.createBlock();
    functionBuilder.blocks.set(exitBlock.id, exitBlock);
    // Set the branch terminal for the test block.
    testBlockTerminus.terminal = new BranchTerminal(createInstructionId(functionBuilder.environment), testPlace, bodyBlock.id, exitBlock.id, exitBlock.id);
    // Set the jump terminal for body block to create a back edge.
    bodyBlockTerminus.terminal = new JumpTerminal(createInstructionId(functionBuilder.environment), testBlock.id);
    // Set the jump terminal for the current block.
    currentBlock.terminal = new JumpTerminal(createInstructionId(functionBuilder.environment), testBlock.id);
    functionBuilder.currentBlock = exitBlock;
    return undefined;
}

export { buildWhileStatement };
//# sourceMappingURL=buildWhileStatement.js.map
