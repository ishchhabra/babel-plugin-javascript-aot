import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { ObjectExpressionInstruction } from '../../../ir/instructions/value/ObjectExpression.js';
import { buildNode } from '../buildNode.js';

function buildObjectExpression(nodePath, functionBuilder, moduleBuilder) {
    const propertiesPath = nodePath.get("properties");
    const propertyPlaces = propertiesPath.map((propertyPath) => {
        const propertyPlace = buildNode(propertyPath, functionBuilder, moduleBuilder);
        if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
            throw new Error("Object expression property must be a single place");
        }
        return propertyPlace;
    });
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(new ObjectExpressionInstruction(instructionId, place, nodePath, propertyPlaces));
    return place;
}

export { buildObjectExpression };
//# sourceMappingURL=buildObjectExpression.js.map
