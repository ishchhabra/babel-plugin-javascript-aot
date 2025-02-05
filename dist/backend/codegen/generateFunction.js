import * as t from '@babel/types';
import { generateBlock } from './generateBlock.js';
import { generateInstruction } from './instructions/generateInstruction.js';

function generateFunction(functionIR, generator) {
    generateHeader(functionIR, generator);
    const params = generateFunctionParams(functionIR, generator);
    const entryBlock = functionIR.entryBlockId;
    const statements = generateBlock(entryBlock, functionIR, generator);
    return { params, statements };
}
function generateFunctionParams(functionIR, generator) {
    return functionIR.params.map((param) => {
        const node = generator.places.get(param.id);
        if (node === undefined) {
            throw new Error(`Place ${param.id} not found`);
        }
        if (node === null) {
            throw new Error(`Holes are not supported in function parameters.`);
        }
        if (!(t.isIdentifier(node) || t.isPattern(node) || t.isRestElement(node))) {
            throw new Error(`Unsupported function param: ${node.type}`);
        }
        return node;
    });
}
function generateHeader(functionIR, generator) {
    for (const instruction of functionIR.header) {
        generateInstruction(instruction, functionIR, generator);
    }
}

export { generateFunction };
//# sourceMappingURL=generateFunction.js.map
