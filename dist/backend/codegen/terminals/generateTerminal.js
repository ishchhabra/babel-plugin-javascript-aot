import { BranchTerminal, JumpTerminal, ReturnTerminal } from '../../../ir/core/Terminal.js';
import 'lodash-es';
import { generateBranchTerminal } from './generateBranch.js';
import { generateJumpTerminal } from './generateJump.js';
import { generateReturnTerminal } from './generateReturn.js';

function generateTerminal(terminal, functionIR, generator) {
    if (terminal instanceof BranchTerminal) {
        return generateBranchTerminal(terminal, functionIR, generator);
    }
    else if (terminal instanceof JumpTerminal) {
        return generateJumpTerminal(terminal, functionIR, generator);
    }
    else if (terminal instanceof ReturnTerminal) {
        return generateReturnTerminal(terminal, generator);
    }
    throw new Error(`Unsupported terminal type: ${terminal.constructor.name}`);
}

export { generateTerminal };
//# sourceMappingURL=generateTerminal.js.map
