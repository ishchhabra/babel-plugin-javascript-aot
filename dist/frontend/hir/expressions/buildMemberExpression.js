import 'lodash-es';
import { MemberExpressionInstruction } from '../../../ir/instructions/value/MemberExpression.js';
import { buildNode } from '../buildNode.js';

function buildMemberExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const objectPath = nodePath.get("object");
    const objectPlace = buildNode(objectPath, functionBuilder, moduleBuilder, environment);
    if (objectPlace === undefined || Array.isArray(objectPlace)) {
        throw new Error("Member expression object must be a single place");
    }
    const propertyPath = nodePath.get("property");
    const propertyPlace = buildNode(propertyPath, functionBuilder, moduleBuilder, environment);
    if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
        throw new Error("Member expression property must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(MemberExpressionInstruction, place, nodePath, objectPlace, propertyPlace, nodePath.node.computed);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildMemberExpression };
//# sourceMappingURL=buildMemberExpression.js.map
