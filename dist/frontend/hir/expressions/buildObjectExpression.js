import { createInstructionId } from '../../../ir/utils.js';
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
    const instructionId = createInstructionId(environment);
    functionBuilder.addInstruction(new ObjectExpressionInstruction(instructionId, place, nodePath, propertyPlaces));
    return place;
}

export { buildObjectExpression };
//# sourceMappingURL=buildObjectExpression.js.map
