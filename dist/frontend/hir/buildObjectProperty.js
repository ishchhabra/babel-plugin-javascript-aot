import 'lodash-es';
import { ObjectPropertyInstruction } from '../../ir/instructions/value/ObjectProperty.js';
import { buildNode } from './buildNode.js';

function buildObjectProperty(nodePath, functionBuilder, moduleBuilder, environment) {
    const keyPath = nodePath.get("key");
    const keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder, environment);
    if (keyPlace === undefined || Array.isArray(keyPlace)) {
        throw new Error(`Object property key must be a single place`);
    }
    const valuePath = nodePath.get("value");
    const valuePlace = buildNode(valuePath, functionBuilder, moduleBuilder, environment);
    if (valuePlace === undefined || Array.isArray(valuePlace)) {
        throw new Error(`Object property value must be a single place`);
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ObjectPropertyInstruction, place, nodePath, keyPlace, valuePlace, nodePath.node.computed, nodePath.node.shorthand);
    functionBuilder.addInstruction(instruction);
    return place;
}

export { buildObjectProperty };
//# sourceMappingURL=buildObjectProperty.js.map
