import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { ArrayExpressionInstruction } from '../../../ir/instructions/value/ArrayExpression.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildArrayExpression(nodePath, builder) {
    const elementsPath = nodePath.get("elements");
    const elementPlaces = elementsPath.map((elementPath) => {
        const elementPlace = buildNode(elementPath, builder);
        if (elementPlace === undefined || Array.isArray(elementPlace)) {
            throw new Error("Array expression element must be a single place");
        }
        return elementPlace;
    });
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new ArrayExpressionInstruction(instructionId, place, nodePath, elementPlaces));
    return place;
}

export { buildArrayExpression };
//# sourceMappingURL=buildArrayExpression.js.map
