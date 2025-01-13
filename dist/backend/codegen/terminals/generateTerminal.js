import { BranchTerminal, JumpTerminal, ReturnTerminal } from '../../../ir/core/Terminal.js';
import { generateBranchTerminal } from './generateBranch.js';
import { generateJumpTerminal } from './generateJump.js';
import { generateReturnTerminal } from './generateReturn.js';

function generateTerminal(terminal, generator) {
    if (terminal instanceof BranchTerminal) {
        return generateBranchTerminal(terminal, generator);
    }
    else if (terminal instanceof JumpTerminal) {
        return generateJumpTerminal(terminal, generator);
    }
    else if (terminal instanceof ReturnTerminal) {
        return generateReturnTerminal(terminal, generator);
    }
    throw new Error(`Unsupported terminal type: ${terminal.constructor.name}`);
}

export { generateTerminal };
//# sourceMappingURL=generateTerminal.js.map
