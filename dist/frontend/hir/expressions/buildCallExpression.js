import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { CallExpressionInstruction } from '../../../ir/instructions/value/CallExpression.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildCallExpression(expressionPath, functionBuilder, moduleBuilder) {
    const calleePath = expressionPath.get("callee");
    if (!calleePath.isExpression()) {
        throw new Error(`Unsupported callee type: ${calleePath.type}`);
    }
    const calleePlace = buildNode(calleePath, functionBuilder, moduleBuilder);
    if (calleePlace === undefined || Array.isArray(calleePlace)) {
        throw new Error("Call expression callee must be a single place");
    }
    const argumentsPath = expressionPath.get("arguments");
    const argumentPlaces = argumentsPath.map((argumentPath) => {
        const argumentPlace = buildNode(argumentPath, functionBuilder, moduleBuilder);
        if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
            throw new Error("Call expression argument must be a single place");
        }
        return argumentPlace;
    });
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    functionBuilder.currentBlock.instructions.push(new CallExpressionInstruction(instructionId, place, expressionPath, calleePlace, argumentPlaces));
    return place;
}

export { buildCallExpression };
//# sourceMappingURL=buildCallExpression.js.map
