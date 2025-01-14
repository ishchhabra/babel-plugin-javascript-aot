import { makeInstructionId } from '../../../ir/base/Instruction.js';
import { ArrayPatternInstruction } from '../../../ir/instructions/pattern/ArrayPattern.js';
import { createIdentifier, createPlace } from '../../../ir/utils.js';
import { buildNode } from '../buildNode.js';

function buildArrayPattern(nodePath, builder) {
    const elementPaths = nodePath.get("elements");
    const elementPlaces = elementPaths.map((elementPath) => {
        const elementPlace = buildNode(elementPath, builder);
        if (elementPlace === undefined || Array.isArray(elementPlace)) {
            throw new Error("Array pattern element must be a single place");
        }
        return elementPlace;
    });
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new ArrayPatternInstruction(instructionId, place, nodePath, elementPlaces));
    return place;
}

export { buildArrayPattern };
//# sourceMappingURL=buildArrayPattern.js.map
