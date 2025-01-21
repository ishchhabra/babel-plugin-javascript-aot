import * as t from '@babel/types';
import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { JumpTerminal, BranchTerminal } from '../../../ir/core/Terminal.js';
import { createBlock, createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { ExpressionStatementInstruction } from '../../../ir/instructions/ExpressionStatement.js';
import { buildBindings } from '../bindings/buildBindings.js';
import { buildNode } from '../buildNode.js';
import { buildStatement } from './buildStatement.js';

function buildForStatement(nodePath, functionBuilder, moduleBuilder) {
    const currentBlock = functionBuilder.currentBlock;
    // Build the init block.
    const initPath = nodePath.get("init");
    const initBlock = createBlock(functionBuilder.environment);
    functionBuilder.blocks.set(initBlock.id, initBlock);
    functionBuilder.currentBlock = initBlock;
    if (initPath.hasNode()) {
        // If the init is an expression, wrap it with an expression statement.
        if (initPath.isExpression()) {
            initPath.replaceWith(t.expressionStatement(initPath.node));
        }
        initPath.assertStatement();
        buildBindings(nodePath, functionBuilder);
        buildStatement(initPath, functionBuilder, moduleBuilder);
    }
    const initBlockTerminus = functionBuilder.currentBlock;
    // Build the test block.
    const testPath = nodePath.get("test");
    const testBlock = createBlock(functionBuilder.environment);
    functionBuilder.blocks.set(testBlock.id, testBlock);
    // If the test is not provided, it is equivalent to while(true).
    if (!testPath.hasNode()) {
        testPath.replaceWith(t.valueToNode(true));
    }
    testPath.assertExpression();
    functionBuilder.currentBlock = testBlock;
    const testPlace = buildNode(testPath, functionBuilder, moduleBuilder);
    if (testPlace === undefined || Array.isArray(testPlace)) {
        throw new Error("For statement test place must be a single place");
    }
    const testBlockTerminus = functionBuilder.currentBlock;
    // Build the body block.
    const bodyPath = nodePath.get("body");
    const bodyBlock = createBlock(functionBuilder.environment);
    functionBuilder.blocks.set(bodyBlock.id, bodyBlock);
    functionBuilder.currentBlock = bodyBlock;
    buildNode(bodyPath, functionBuilder, moduleBuilder);
    // Build the update inside body block.
    const updatePath = nodePath.get("update");
    if (updatePath.hasNode()) {
        buildExpressionAsStatement(updatePath, functionBuilder, moduleBuilder);
    }
    const bodyBlockTerminus = functionBuilder.currentBlock;
    // Build the exit block.
    const exitBlock = createBlock(functionBuilder.environment);
    functionBuilder.blocks.set(exitBlock.id, exitBlock);
    // Set the jump terminal for init block to test block.
    initBlockTerminus.terminal = new JumpTerminal(makeInstructionId(functionBuilder.environment.nextInstructionId++), testBlock.id);
    // Set the branch terminal for test block.
    testBlockTerminus.terminal = new BranchTerminal(makeInstructionId(functionBuilder.environment.nextInstructionId++), testPlace, bodyBlock.id, exitBlock.id, exitBlock.id);
    // Set the jump terminal for body block to create a back edge.
    bodyBlockTerminus.terminal = new JumpTerminal(makeInstructionId(functionBuilder.environment.nextInstructionId++), testBlock.id);
    // Set the jump terminal for the current block.
    currentBlock.terminal = new JumpTerminal(makeInstructionId(functionBuilder.environment.nextInstructionId++), initBlock.id);
    functionBuilder.currentBlock = exitBlock;
    return undefined;
}
function buildExpressionAsStatement(expressionPath, functionBuilder, moduleBuilder) {
    const expressionPlace = buildNode(expressionPath, functionBuilder, moduleBuilder);
    if (expressionPlace === undefined || Array.isArray(expressionPlace)) {
        throw new Error("Expression place is undefined");
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.currentBlock.instructions.push(new ExpressionStatementInstruction(instructionId, place, expressionPath, expressionPlace));
}

export { buildForStatement };
//# sourceMappingURL=buildForStatement.js.map
