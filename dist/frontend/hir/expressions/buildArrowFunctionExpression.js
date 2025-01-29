import { createInstructionId } from '../../../ir/utils.js';
import { ArrowFunctionExpressionInstruction } from '../../../ir/instructions/value/ArrowFunctionExpression.js';
import { FunctionIRBuilder } from '../FunctionIRBuilder.js';

function buildArrowFunctionExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const paramPaths = nodePath.get("params");
    const bodyPath = nodePath.get("body");
    const functionIR = new FunctionIRBuilder(paramPaths, bodyPath, functionBuilder.environment, moduleBuilder).build();
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    functionBuilder.addInstruction(new ArrowFunctionExpressionInstruction(createInstructionId(environment), place, nodePath, functionIR, nodePath.node.async, bodyPath.isExpression(), false));
    return place;
}

export { buildArrowFunctionExpression };
//# sourceMappingURL=buildArrowFunctionExpression.js.map
