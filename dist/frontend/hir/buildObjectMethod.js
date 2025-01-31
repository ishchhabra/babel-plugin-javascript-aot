import 'lodash-es';
import { ObjectMethodInstruction } from '../../ir/instructions/value/ObjectMethod.js';
import { buildNode } from './buildNode.js';
import { FunctionIRBuilder } from './FunctionIRBuilder.js';

function buildObjectMethod(nodePath, functionBuilder, moduleBuilder, environment) {
    // Build the key place
    const keyPath = nodePath.get("key");
    const keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder, environment);
    if (keyPlace === undefined || Array.isArray(keyPlace)) {
        throw new Error(`Unable to build key place for ${nodePath.type}`);
    }
    const paramPaths = nodePath.get("params");
    const bodyPath = nodePath.get("body");
    const bodyIR = new FunctionIRBuilder(paramPaths, bodyPath, environment, moduleBuilder).build();
    const methodIdentifier = environment.createIdentifier();
    const methodPlace = environment.createPlace(methodIdentifier);
    const instruction = environment.createInstruction(ObjectMethodInstruction, methodPlace, nodePath, keyPlace, bodyIR, nodePath.node.computed, nodePath.node.generator, nodePath.node.async, nodePath.node.kind);
    functionBuilder.addInstruction(instruction);
    return methodPlace;
}

export { buildObjectMethod };
//# sourceMappingURL=buildObjectMethod.js.map
