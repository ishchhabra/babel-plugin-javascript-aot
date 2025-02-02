import { BinaryExpressionInstruction } from '../../../ir/instructions/value/BinaryExpression.js';
import 'lodash-es';
import { buildNode } from '../buildNode.js';

function buildBinaryExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const leftPath = nodePath.get("left");
    leftPath.assertExpression();
    const leftPlace = buildNode(leftPath, functionBuilder, moduleBuilder, environment);
    if (leftPlace === undefined || Array.isArray(leftPlace)) {
        throw new Error("Binary expression left must be a single place");
    }
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder, environment);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Binary expression right must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(BinaryExpressionInstruction, place, nodePath, nodePath.node.operator, leftPlace, rightPlace);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildBinaryExpression };
//# sourceMappingURL=buildBinaryExpression.js.map
