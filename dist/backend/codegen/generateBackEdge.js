import { BranchTerminal } from '../../ir/core/Terminal.js';
import * as t from '@babel/types';
import { generateBasicBlock } from './generateBlock.js';

function generateBackEdge(blockId, generator) {
    const terminal = generator.blocks.get(blockId).terminal;
    if (!(terminal instanceof BranchTerminal)) {
        throw new Error(`Unsupported back edge from ${blockId} to ${blockId} (${terminal.constructor.name})`);
    }
    const test = generator.places.get(terminal.test.id);
    if (test === undefined) {
        throw new Error(`Place ${terminal.test.id} not found`);
    }
    t.assertExpression(test);
    const bodyInstructions = generateBasicBlock(terminal.consequent, generator);
    // NOTE: No need to generate the consequent block, because in a while loop
    // it's the same as the fallthrough block.
    const exitInstructions = generateBasicBlock(terminal.fallthrough, generator);
    const node = t.whileStatement(test, t.blockStatement(bodyInstructions));
    return [node, ...exitInstructions];
}

export { generateBackEdge };
//# sourceMappingURL=generateBackEdge.js.map