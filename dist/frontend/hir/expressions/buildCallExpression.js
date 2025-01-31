import { CallExpressionInstruction } from '../../../ir/instructions/value/CallExpression.js';
import 'lodash-es';
import { buildNode } from '../buildNode.js';

function buildCallExpression(expressionPath, functionBuilder, moduleBuilder, environment) {
    const calleePath = expressionPath.get("callee");
    if (!calleePath.isExpression()) {
        throw new Error(`Unsupported callee type: ${calleePath.type}`);
    }
    const calleePlace = buildNode(calleePath, functionBuilder, moduleBuilder, environment);
    if (calleePlace === undefined || Array.isArray(calleePlace)) {
        throw new Error("Call expression callee must be a single place");
    }
    const argumentsPath = expressionPath.get("arguments");
    const argumentPlaces = argumentsPath.map((argumentPath) => {
        const argumentPlace = buildNode(argumentPath, functionBuilder, moduleBuilder, environment);
        if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
            throw new Error("Call expression argument must be a single place");
        }
        return argumentPlace;
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(CallExpressionInstruction, place, expressionPath, calleePlace, argumentPlaces);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildCallExpression };
//# sourceMappingURL=buildCallExpression.js.map
