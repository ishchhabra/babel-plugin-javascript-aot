import { generateBlock } from '../generateBlock.js';

function generateJumpTerminal(terminal, generator) {
    return generateBlock(terminal.target, generator);
}

export { generateJumpTerminal };
//# sourceMappingURL=generateJump.js.map
