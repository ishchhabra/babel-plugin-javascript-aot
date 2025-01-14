import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { ReturnTerminal } from '../../../ir/core/Terminal.js';
import { buildNode } from '../buildNode.js';

function buildReturnStatement(nodePath, builder) {
    const argument = nodePath.get("argument");
    if (!argument.hasNode()) {
        return;
    }
    const valuePlace = buildNode(argument, builder);
    if (valuePlace === undefined || Array.isArray(valuePlace)) {
        throw new Error("Return statement argument must be a single place");
    }
    builder.currentBlock.terminal = new ReturnTerminal(makeInstructionId(builder.environment.nextInstructionId++), valuePlace);
    return undefined;
}

export { buildReturnStatement };
//# sourceMappingURL=buildReturnStatement.js.map
