import { generateBackEdge } from './generateBackEdge.js';
import { generateInstruction } from './instructions/generateInstruction.js';
import { generateTerminal } from './terminals/generateTerminal.js';

function generateBlock(blockId, functionIR, generator) {
    if (generator.generatedBlocks.has(blockId)) {
        return [];
    }
    generator.generatedBlocks.add(blockId);
    const block = functionIR.blocks.get(blockId);
    if (block === undefined) {
        throw new Error(`Block ${blockId} not found`);
    }
    const statements = generateBasicBlock(blockId, functionIR, generator);
    generator.blockToStatements.set(blockId, statements);
    return statements;
}
function generateBasicBlock(blockId, functionIR, generator) {
    const block = functionIR.blocks.get(blockId);
    if (block === undefined) {
        throw new Error(`Block ${blockId} not found`);
    }
    const statements = [];
    for (const instruction of block.instructions) {
        statements.push(...generateInstruction(instruction, functionIR, generator));
    }
    const backEdges = functionIR.backEdges.get(blockId);
    if (backEdges.size > 1) {
        throw new Error(`Block ${blockId} has multiple back edges`);
    }
    if (backEdges.size > 0) {
        return generateBackEdge(blockId, functionIR, generator);
    }
    const terminal = block.terminal;
    if (terminal !== undefined) {
        statements.push(...generateTerminal(terminal, functionIR, generator));
    }
    generator.blockToStatements.set(blockId, statements);
    return statements;
}

export { generateBasicBlock, generateBlock };
//# sourceMappingURL=generateBlock.js.map
