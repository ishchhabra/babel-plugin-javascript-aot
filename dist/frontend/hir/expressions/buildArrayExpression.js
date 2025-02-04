import { ArrayExpressionInstruction } from '../../../ir/instructions/value/ArrayExpression.js';
import 'lodash-es';
import { buildNode } from '../buildNode.js';

function buildArrayExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const elementsPath = nodePath.get("elements");
    const elementPlaces = elementsPath.map((elementPath) => {
        const elementPlace = buildNode(elementPath, functionBuilder, moduleBuilder, environment);
        if (elementPlace === undefined || Array.isArray(elementPlace)) {
            throw new Error("Array expression element must be a single place");
        }
        return elementPlace;
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ArrayExpressionInstruction, place, nodePath, elementPlaces);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildArrayExpression };
//# sourceMappingURL=buildArrayExpression.js.map
