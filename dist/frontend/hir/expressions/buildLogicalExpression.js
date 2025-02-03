import 'lodash-es';
import { LogicalExpressionInstruction } from '../../../ir/instructions/value/LogicalExpression.js';
import { buildNode } from '../buildNode.js';

function buildLogicalExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const leftPath = nodePath.get("left");
    const leftPlace = buildNode(leftPath, functionBuilder, moduleBuilder, environment);
    if (leftPlace === undefined || Array.isArray(leftPlace)) {
        throw new Error("Logical expression left must be a single place");
    }
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder, environment);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Logical expression right must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(LogicalExpressionInstruction, place, nodePath, nodePath.node.operator, leftPlace, rightPlace);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildLogicalExpression };
//# sourceMappingURL=buildLogicalExpression.js.map
