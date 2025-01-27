import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { FunctionExpressionInstruction } from '../../../ir/instructions/value/FunctionExpression.js';
import { buildIdentifier } from '../buildIdentifier.js';
import { FunctionIRBuilder } from '../FunctionIRBuilder.js';

function buildFunctionExpression(nodePath, functionBuilder, moduleBuilder) {
    const idPath = nodePath.get("id");
    idPath.assertIdentifier();
    console.log(`Building function expression ${idPath.node.name} ${idPath.type}`);
    const identifierPlace = buildIdentifier(idPath, functionBuilder);
    const paramPaths = nodePath.get("params");
    const bodyPath = nodePath.get("body");
    const functionIR = new FunctionIRBuilder(paramPaths, bodyPath, functionBuilder.environment, moduleBuilder).build();
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    functionBuilder.addInstruction(new FunctionExpressionInstruction(createInstructionId(functionBuilder.environment), place, nodePath, identifierPlace, functionIR, nodePath.node.generator, nodePath.node.async));
    return place;
}

export { buildFunctionExpression };
//# sourceMappingURL=buildFunctionExpression.js.map
