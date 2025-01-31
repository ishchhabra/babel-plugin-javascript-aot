import { FunctionExpressionInstruction } from '../../../ir/instructions/value/FunctionExpression.js';
import { buildIdentifier } from '../buildIdentifier.js';
import { FunctionIRBuilder } from '../FunctionIRBuilder.js';

function buildFunctionExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const idPath = nodePath.get("id");
    if (idPath.hasNode() && !idPath.isIdentifier()) {
        throw new Error("Function expression identifier is not an identifier");
    }
    const identifierPlace = idPath.hasNode()
        ? buildIdentifier(idPath, functionBuilder, environment)
        : null;
    const paramPaths = nodePath.get("params");
    const bodyPath = nodePath.get("body");
    const functionIR = new FunctionIRBuilder(paramPaths, bodyPath, functionBuilder.environment, moduleBuilder).build();
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(FunctionExpressionInstruction, place, nodePath, identifierPlace, functionIR, nodePath.node.generator, nodePath.node.async);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildFunctionExpression };
//# sourceMappingURL=buildFunctionExpression.js.map
