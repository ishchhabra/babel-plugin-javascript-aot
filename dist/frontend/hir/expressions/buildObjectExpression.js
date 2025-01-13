import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { ObjectExpressionInstruction } from '../../../ir/instructions/value/ObjectExpression.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildObjectExpression(nodePath, builder) {
    const propertiesPath = nodePath.get("properties");
    const propertyPlaces = propertiesPath.map((propertyPath) => {
        const propertyPlace = buildNode(propertyPath, builder);
        if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
            throw new Error("Object expression property must be a single place");
        }
        return propertyPlace;
    });
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new ObjectExpressionInstruction(instructionId, place, nodePath, propertyPlaces));
    return place;
}

export { buildObjectExpression };
//# sourceMappingURL=buildObjectExpression.js.map
