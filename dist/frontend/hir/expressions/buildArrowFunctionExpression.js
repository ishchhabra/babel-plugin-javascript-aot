import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { ArrowFunctionExpressionInstruction } from '../../../ir/instructions/value/ArrowFunctionExpression.js';
import { FunctionIRBuilder } from '../FunctionIRBuilder.js';

function buildArrowFunctionExpression(nodePath, functionBuilder, moduleBuilder) {
    const paramPaths = nodePath.get("params");
    const bodyPath = nodePath.get("body");
    const functionIR = new FunctionIRBuilder(paramPaths, bodyPath, functionBuilder.environment, moduleBuilder).build();
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    functionBuilder.addInstruction(new ArrowFunctionExpressionInstruction(createInstructionId(functionBuilder.environment), place, nodePath, functionIR, nodePath.node.async, bodyPath.isExpression(), false));
    return place;
}

export { buildArrowFunctionExpression };
//# sourceMappingURL=buildArrowFunctionExpression.js.map
