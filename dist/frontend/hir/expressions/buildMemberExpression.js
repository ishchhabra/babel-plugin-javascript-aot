import { isStaticMemberAccess } from '../../../babel-utils.js';
import { LoadDynamicPropertyInstruction } from '../../../ir/instructions/memory/LoadDynamicProperty.js';
import { LoadStaticPropertyInstruction } from '../../../ir/instructions/memory/LoadStaticProperty.js';
import 'lodash-es';
import { buildNode } from '../buildNode.js';

function buildMemberExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const objectPath = nodePath.get("object");
    const objectPlace = buildNode(objectPath, functionBuilder, moduleBuilder, environment);
    if (objectPlace === undefined || Array.isArray(objectPlace)) {
        throw new Error("Member expression object must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const propertyPath = nodePath.get("property");
    propertyPath.assertExpression();
    if (isStaticMemberAccess(nodePath)) {
        const propertyName = getStaticPropertyName(propertyPath);
        const instruction = environment.createInstruction(LoadStaticPropertyInstruction, place, nodePath, objectPlace, propertyName);
        functionBuilder.addInstruction(instruction);
        return place;
    }
    else {
        const propertyPlace = buildNode(propertyPath, functionBuilder, moduleBuilder, environment);
        if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
            throw new Error("Member expression property must be a single place");
        }
        const instruction = environment.createInstruction(LoadDynamicPropertyInstruction, place, nodePath, objectPlace, propertyPlace);
        functionBuilder.addInstruction(instruction);
        return place;
    }
}
function getStaticPropertyName(nodePath) {
    if (nodePath.isIdentifier()) {
        return nodePath.node.name;
    }
    else if (nodePath.isStringLiteral()) {
        return nodePath.node.value;
    }
    else if (nodePath.isNumericLiteral()) {
        return String(nodePath.node.value);
    }
    throw new Error("Unsupported static property type");
}

export { buildMemberExpression };
//# sourceMappingURL=buildMemberExpression.js.map
