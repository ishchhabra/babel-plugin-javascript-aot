import * as t from '@babel/types';
import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { JumpTerminal, BranchTerminal } from '../../../ir/core/Terminal.js';
import { ExpressionStatementInstruction } from '../../../ir/instructions/ExpressionStatement.js';
import { createBlock, createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildBindings } from '../bindings/buildBindings.js';
import { buildNode } from '../buildNode.js';
import { buildStatement } from './buildStatement.js';

function buildForStatement(nodePath, builder) {
    const currentBlock = builder.currentBlock;
    // Build the init block.
    const initPath = nodePath.get("init");
    const initBlock = createBlock(builder.environment);
    builder.blocks.set(initBlock.id, initBlock);
    builder.currentBlock = initBlock;
    if (initPath.hasNode()) {
        // If the init is an expression, wrap it with an expression statement.
        if (initPath.isExpression()) {
            initPath.replaceWith(t.expressionStatement(initPath.node));
        }
        initPath.assertStatement();
        buildBindings(nodePath, builder);
        buildStatement(initPath, builder);
    }
    const initBlockTerminus = builder.currentBlock;
    // Build the test block.
    const testPath = nodePath.get("test");
    const testBlock = createBlock(builder.environment);
    builder.blocks.set(testBlock.id, testBlock);
    // If the test is not provided, it is equivalent to while(true).
    if (!testPath.hasNode()) {
        testPath.replaceWith(t.valueToNode(true));
    }
    testPath.assertExpression();
    builder.currentBlock = testBlock;
    const testPlace = buildNode(testPath, builder);
    if (testPlace === undefined || Array.isArray(testPlace)) {
        throw new Error("For statement test place must be a single place");
    }
    const testBlockTerminus = builder.currentBlock;
    // Build the body block.
    const bodyPath = nodePath.get("body");
    const bodyBlock = createBlock(builder.environment);
    builder.blocks.set(bodyBlock.id, bodyBlock);
    builder.currentBlock = bodyBlock;
    buildNode(bodyPath, builder);
    // Build the update inside body block.
    const updatePath = nodePath.get("update");
    if (updatePath.hasNode()) {
        buildExpressionAsStatement(updatePath, builder);
    }
    const bodyBlockTerminus = builder.currentBlock;
    // Build the exit block.
    const exitBlock = createBlock(builder.environment);
    builder.blocks.set(exitBlock.id, exitBlock);
    // Set the jump terminal for init block to test block.
    initBlockTerminus.terminal = new JumpTerminal(makeInstructionId(builder.environment.nextInstructionId++), testBlock.id);
    // Set the branch terminal for test block.
    testBlockTerminus.terminal = new BranchTerminal(makeInstructionId(builder.environment.nextInstructionId++), testPlace, bodyBlock.id, exitBlock.id, exitBlock.id);
    // Set the jump terminal for body block to create a back edge.
    bodyBlockTerminus.terminal = new JumpTerminal(makeInstructionId(builder.environment.nextInstructionId++), testBlock.id);
    // Set the jump terminal for the current block.
    currentBlock.terminal = new JumpTerminal(makeInstructionId(builder.environment.nextInstructionId++), initBlock.id);
    builder.currentBlock = exitBlock;
    return undefined;
}
function buildExpressionAsStatement(expressionPath, builder) {
    const expressionPlace = buildNode(expressionPath, builder);
    if (expressionPlace === undefined || Array.isArray(expressionPlace)) {
        throw new Error("Expression place is undefined");
    }
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new ExpressionStatementInstruction(instructionId, place, expressionPath, expressionPlace));
}

export { buildForStatement };
//# sourceMappingURL=buildForStatement.js.map