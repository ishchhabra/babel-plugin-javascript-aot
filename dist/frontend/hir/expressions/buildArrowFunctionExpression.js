import { ArrowFunctionExpressionInstruction } from '../../../ir/instructions/value/ArrowFunctionExpression.js';
import { FunctionIRBuilder } from '../FunctionIRBuilder.js';

function buildArrowFunctionExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const paramPaths = nodePath.get("params");
    const bodyPath = nodePath.get("body");
    const functionIR = new FunctionIRBuilder(paramPaths, bodyPath, functionBuilder.environment, moduleBuilder).build();
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ArrowFunctionExpressionInstruction, place, nodePath, functionIR, nodePath.node.async, bodyPath.isExpression(), false);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildArrowFunctionExpression };
//# sourceMappingURL=buildArrowFunctionExpression.js.map
