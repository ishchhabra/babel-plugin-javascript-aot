import 'lodash-es';
import { UnaryExpressionInstruction } from '../../../ir/instructions/value/UnaryExpression.js';
import { buildNode } from '../buildNode.js';

function buildUnaryExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const argumentPath = nodePath.get("argument");
    const argumentPlace = buildNode(argumentPath, functionBuilder, moduleBuilder, environment);
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
        throw new Error("Unary expression argument must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(UnaryExpressionInstruction, place, nodePath, nodePath.node.operator, argumentPlace);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildUnaryExpression };
//# sourceMappingURL=buildUnaryExpression.js.map
