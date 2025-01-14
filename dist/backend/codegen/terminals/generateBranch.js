import * as t from '@babel/types';
import { generateBlock } from '../generateBlock.js';

function generateBranchTerminal(terminal, generator) {
    // Generate the fallthrough block first so that we do not rebuild it
    // if the alternate block is the same as the fallthrough block.
    const fallthrough = generateBlock(terminal.fallthrough, generator);
    const test = generator.places.get(terminal.test.id);
    if (test === undefined) {
        throw new Error(`Place ${terminal.test.id} not found`);
    }
    t.assertExpression(test);
    const consequent = generateBlock(terminal.consequent, generator);
    let alternate;
    if (terminal.alternate !== terminal.fallthrough) {
        alternate = generateBlock(terminal.alternate, generator);
    }
    const node = t.ifStatement(test, t.blockStatement(consequent), alternate ? t.blockStatement(alternate) : null);
    const statements = [node, ...fallthrough];
    return statements;
}

export { generateBranchTerminal };
//# sourceMappingURL=generateBranch.js.map
