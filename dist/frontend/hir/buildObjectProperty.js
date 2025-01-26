import { makeInstructionId } from '../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { ObjectPropertyInstruction } from '../../ir/instructions/value/ObjectProperty.js';
import { buildNode } from './buildNode.js';

function buildObjectProperty(nodePath, functionBuilder, moduleBuilder) {
    const keyPath = nodePath.get("key");
    const keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder);
    if (keyPlace === undefined || Array.isArray(keyPlace)) {
        throw new Error(`Object property key must be a single place`);
    }
    const valuePath = nodePath.get("value");
    const valuePlace = buildNode(valuePath, functionBuilder, moduleBuilder);
    if (valuePlace === undefined || Array.isArray(valuePlace)) {
        throw new Error(`Object property value must be a single place`);
    }
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    functionBuilder.addInstruction(new ObjectPropertyInstruction(makeInstructionId(functionBuilder.environment.nextInstructionId++), place, nodePath, keyPlace, valuePlace, nodePath.node.computed, nodePath.node.shorthand));
    return place;
}

export { buildObjectProperty };
//# sourceMappingURL=buildObjectProperty.js.map
