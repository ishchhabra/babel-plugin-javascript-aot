import { FunctionDeclarationInstruction } from '../../../../ir/instructions/declaration/Function.js';
import 'lodash-es';
import { generateFunctionDeclarationInstruction } from './generateFunctionDeclaration.js';

function generateDeclarationInstruction(instruction, functionIR, generator) {
    if (instruction instanceof FunctionDeclarationInstruction) {
        return generateFunctionDeclarationInstruction(instruction, functionIR, generator);
    }
    throw new Error(`Unsupported declaration type: ${instruction.constructor.name}`);
}

export { generateDeclarationInstruction };
//# sourceMappingURL=generateDeclaration.js.map
