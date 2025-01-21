import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { UnaryExpressionInstruction } from '../../../ir/instructions/value/UnaryExpression.js';
import { buildNode } from '../buildNode.js';

function buildUnaryExpression(nodePath, functionBuilder, moduleBuilder) {
    const argumentPath = nodePath.get("argument");
    const argumentPlace = buildNode(argumentPath, functionBuilder, moduleBuilder);
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
        throw new Error("Unary expression argument must be a single place");
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(new UnaryExpressionInstruction(instructionId, place, nodePath, nodePath.node.operator, argumentPlace));
    return place;
}

export { buildUnaryExpression };
//# sourceMappingURL=buildUnaryExpression.js.map
