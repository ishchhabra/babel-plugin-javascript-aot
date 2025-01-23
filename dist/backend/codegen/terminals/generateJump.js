import { generateBlock } from '../generateBlock.js';

function generateJumpTerminal(terminal, functionIR, generator) {
    return generateBlock(terminal.target, functionIR, generator);
}

export { generateJumpTerminal };
//# sourceMappingURL=generateJump.js.map
