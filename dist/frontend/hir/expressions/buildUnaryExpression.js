import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { UnaryExpressionInstruction } from '../../../ir/instructions/value/UnaryExpression.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildUnaryExpression(nodePath, builder) {
    const argumentPath = nodePath.get("argument");
    const argumentPlace = buildNode(argumentPath, builder);
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
        throw new Error("Unary expression argument must be a single place");
    }
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new UnaryExpressionInstruction(instructionId, place, nodePath, nodePath.node.operator, argumentPlace));
    return place;
}

export { buildUnaryExpression };
//# sourceMappingURL=buildUnaryExpression.js.map
