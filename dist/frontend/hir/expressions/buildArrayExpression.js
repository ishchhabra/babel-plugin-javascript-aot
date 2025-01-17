import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { ArrayExpressionInstruction } from '../../../ir/instructions/value/ArrayExpression.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildArrayExpression(nodePath, functionBuilder, moduleBuilder) {
    const elementsPath = nodePath.get("elements");
    const elementPlaces = elementsPath.map((elementPath) => {
        const elementPlace = buildNode(elementPath, functionBuilder, moduleBuilder);
        if (elementPlace === undefined || Array.isArray(elementPlace)) {
            throw new Error("Array expression element must be a single place");
        }
        return elementPlace;
    });
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    functionBuilder.currentBlock.instructions.push(new ArrayExpressionInstruction(instructionId, place, nodePath, elementPlaces));
    return place;
}

export { buildArrayExpression };
//# sourceMappingURL=buildArrayExpression.js.map
