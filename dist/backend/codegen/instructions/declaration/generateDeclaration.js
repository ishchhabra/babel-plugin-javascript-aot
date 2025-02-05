import { FunctionDeclarationInstruction } from '../../../../ir/instructions/declaration/Function.js';
import 'lodash-es';
import { generateFunctionDeclarationInstruction } from './generateFunctionDeclaration.js';

function generateDeclarationInstruction(instruction, generator) {
    if (instruction instanceof FunctionDeclarationInstruction) {
        return generateFunctionDeclarationInstruction(instruction, generator);
    }
    throw new Error(`Unsupported declaration type: ${instruction.constructor.name}`);
}

export { generateDeclarationInstruction };
//# sourceMappingURL=generateDeclaration.js.map
