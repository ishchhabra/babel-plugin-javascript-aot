import { generateBlock } from './generateBlock.js';

function generateFunction(functionIR, generator) {
    const entryBlock = functionIR.entryBlockId;
    const statements = generateBlock(entryBlock, functionIR, generator);
    return statements;
}

export { generateFunction };
//# sourceMappingURL=generateFunction.js.map
