import { ReturnTerminal } from '../../../ir/core/Terminal.js';
import { createInstructionId } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildReturnStatement(nodePath, functionBuilder, moduleBuilder) {
    const argument = nodePath.get("argument");
    if (!argument.hasNode()) {
        return;
    }
    const valuePlace = buildNode(argument, functionBuilder, moduleBuilder);
    if (valuePlace === undefined || Array.isArray(valuePlace)) {
        throw new Error("Return statement argument must be a single place");
    }
    functionBuilder.currentBlock.terminal = new ReturnTerminal(createInstructionId(functionBuilder.environment), valuePlace);
    return undefined;
}

export { buildReturnStatement };
//# sourceMappingURL=buildReturnStatement.js.map
