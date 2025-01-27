import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { ArrayPatternInstruction } from '../../../ir/instructions/pattern/ArrayPattern.js';
import { buildNode } from '../buildNode.js';

function buildArrayPattern(nodePath, functionBuilder, moduleBuilder) {
    const elementPaths = nodePath.get("elements");
    const elementPlaces = elementPaths.map((elementPath) => {
        const elementPlace = buildNode(elementPath, functionBuilder, moduleBuilder);
        if (elementPlace === undefined || Array.isArray(elementPlace)) {
            throw new Error("Array pattern element must be a single place");
        }
        return elementPlace;
    });
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(new ArrayPatternInstruction(instructionId, place, nodePath, elementPlaces));
    return place;
}

export { buildArrayPattern };
//# sourceMappingURL=buildArrayPattern.js.map
