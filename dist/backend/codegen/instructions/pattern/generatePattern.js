import 'lodash-es';
import { SpreadElementInstruction } from '../../../../ir/instructions/SpreadElement.js';
import { ArrayPatternInstruction } from '../../../../ir/instructions/pattern/ArrayPattern.js';
import { generateArrayPatternInstruction } from './generateArrayPattern.js';
import { generateSpreadElementInstruction } from './generateSpreadElement.js';

function generatePatternInstruction(instruction, generator) {
    if (instruction instanceof ArrayPatternInstruction) {
        return generateArrayPatternInstruction(instruction, generator);
    }
    else if (instruction instanceof SpreadElementInstruction) {
        return generateSpreadElementInstruction(instruction, generator);
    }
    throw new Error(`Unsupported pattern type: ${instruction.constructor.name}`);
}

export { generatePatternInstruction };
//# sourceMappingURL=generatePattern.js.map
