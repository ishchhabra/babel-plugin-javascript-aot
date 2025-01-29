import { makeInstructionId } from '../../../ir/base/Instruction.js';
import 'lodash-es';
import { ArrayExpressionInstruction } from '../../../ir/instructions/value/ArrayExpression.js';
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
    const instructionId = makeInstructionId(environment.nextInstructionId++);
    functionBuilder.addInstruction(new ArrayExpressionInstruction(instructionId, place, nodePath, elementPlaces));
    return place;
}

export { buildArrayExpression };
//# sourceMappingURL=buildArrayExpression.js.map
