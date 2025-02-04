import 'lodash-es';
import { ObjectExpressionInstruction } from '../../../ir/instructions/value/ObjectExpression.js';
import { buildNode } from '../buildNode.js';

function buildObjectExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const propertiesPath = nodePath.get("properties");
    const propertyPlaces = propertiesPath.map((propertyPath) => {
        const propertyPlace = buildNode(propertyPath, functionBuilder, moduleBuilder, environment);
        if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
            throw new Error("Object expression property must be a single place");
        }
        return propertyPlace;
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ObjectExpressionInstruction, place, nodePath, propertyPlaces);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildObjectExpression };
//# sourceMappingURL=buildObjectExpression.js.map
