import { ArrayPatternInstruction } from '../../../ir/instructions/pattern/ArrayPattern.js';
import 'lodash-es';
import { buildNode } from '../buildNode.js';

function buildArrayPattern(nodePath, functionBuilder, moduleBuilder, environment) {
    const elementPaths = nodePath.get("elements");
    const elementPlaces = elementPaths.map((elementPath) => {
        const elementPlace = buildNode(elementPath, functionBuilder, moduleBuilder, environment);
        if (elementPlace === undefined || Array.isArray(elementPlace)) {
            throw new Error("Array pattern element must be a single place");
        }
        return elementPlace;
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ArrayPatternInstruction, place, nodePath, elementPlaces);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildArrayPattern };
//# sourceMappingURL=buildArrayPattern.js.map
