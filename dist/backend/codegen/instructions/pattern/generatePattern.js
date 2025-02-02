import { SpreadElementInstruction } from '../../../../ir/instructions/SpreadElement.js';
import { ArrayPatternInstruction } from '../../../../ir/instructions/pattern/ArrayPattern.js';
import 'lodash-es';
import { AssignmentPatternInstruction } from '../../../../ir/instructions/pattern/AssignmentPattern.js';
import { ObjectPatternInstruction } from '../../../../ir/instructions/pattern/ObjectPattern.js';
import { generateArrayPatternInstruction } from './generateArrayPattern.js';
import { generateAssignmentPatternInstruction } from './generateAssignmentPattern.js';
import { generateObjectPatternInstruction } from './generateObjectPattern.js';
import { generateSpreadElementInstruction } from './generateSpreadElement.js';

function generatePatternInstruction(instruction, generator) {
    if (instruction instanceof ArrayPatternInstruction) {
        return generateArrayPatternInstruction(instruction, generator);
    }
    else if (instruction instanceof AssignmentPatternInstruction) {
        return generateAssignmentPatternInstruction(instruction, generator);
    }
    else if (instruction instanceof ObjectPatternInstruction) {
        return generateObjectPatternInstruction(instruction, generator);
    }
    else if (instruction instanceof SpreadElementInstruction) {
        return generateSpreadElementInstruction(instruction, generator);
    }
    throw new Error(`Unsupported pattern type: ${instruction.constructor.name}`);
}

export { generatePatternInstruction };
//# sourceMappingURL=generatePattern.js.map
