import { generateBasicBlock } from './generateBlock.js';

function generateFunction(functionIR, generator) {
    const entryBlock = functionIR.blocks.keys().next().value;
    const statements = generateBasicBlock(entryBlock, functionIR, generator);
    return statements;
}

export { generateFunction };
//# sourceMappingURL=generateFunction.js.map
