import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { createInstructionId } from '../../../ir/utils.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { buildBinaryExpression } from './buildBinaryExpression.js';

function buildUpdateExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const argumentPath = nodePath.get("argument");
    if (!argumentPath.isIdentifier()) {
        throw new Error(`Unsupported argument type: ${argumentPath.type}`);
    }
    const declarationId = functionBuilder.getDeclarationId(argumentPath.node.name, nodePath);
    if (declarationId === undefined) {
        throw new Error(`Variable accessed before declaration: ${argumentPath.node.name}`);
    }
    const originalPlace = functionBuilder.getLatestDeclarationPlace(declarationId);
    if (originalPlace === undefined) {
        throw new Error(`Unable to find the place for ${argumentPath.node.name} (${declarationId})`);
    }
    const lvalIdentifier = environment.createIdentifier(declarationId);
    const lvalPlace = environment.createPlace(lvalIdentifier);
    const rightLiteral = t.numericLiteral(1);
    const isIncrement = nodePath.node.operator === "++";
    const binaryExpression = t.binaryExpression(isIncrement ? "+" : "-", argumentPath.node, rightLiteral);
    const binaryExpressionPath = createSyntheticBinaryPath(nodePath, binaryExpression);
    const valuePlace = buildBinaryExpression(binaryExpressionPath, functionBuilder, moduleBuilder, environment);
    if (valuePlace === undefined || Array.isArray(valuePlace)) {
        throw new Error("Update expression value must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    functionBuilder.registerDeclarationPlace(declarationId, lvalPlace);
    functionBuilder.addInstruction(new StoreLocalInstruction(instructionId, place, nodePath, lvalPlace, valuePlace, "const"));
    return nodePath.node.prefix ? valuePlace : originalPlace;
}
function createSyntheticBinaryPath(parentPath, binExpr) {
    const containerNode = t.expressionStatement(binExpr);
    const newPath = NodePath.get({
        hub: parentPath.hub,
        parentPath,
        parent: parentPath.node,
        container: containerNode,
        key: "expression",
    });
    return newPath;
}

export { buildUpdateExpression };
//# sourceMappingURL=buildUpdateExpression.js.map
