import { makeInstructionId } from '../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { ObjectMethodInstruction } from '../../ir/instructions/value/ObjectMethod.js';
import { buildNode } from './buildNode.js';
import { FunctionIRBuilder } from './FunctionIRBuilder.js';

function buildObjectMethod(nodePath, functionBuilder, moduleBuilder) {
    // Build the key place
    const keyPath = nodePath.get("key");
    const keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder);
    if (keyPlace === undefined || Array.isArray(keyPlace)) {
        throw new Error(`Unable to build key place for ${nodePath.type}`);
    }
    const paramPaths = nodePath.get("params");
    const bodyPath = nodePath.get("body");
    const bodyIR = new FunctionIRBuilder(paramPaths, bodyPath, functionBuilder.environment, moduleBuilder).build();
    const methodIdentifier = createIdentifier(functionBuilder.environment);
    const methodPlace = createPlace(methodIdentifier, functionBuilder.environment);
    const methodInstructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    functionBuilder.addInstruction(new ObjectMethodInstruction(methodInstructionId, methodPlace, nodePath, keyPlace, bodyIR, nodePath.node.computed, nodePath.node.generator, nodePath.node.async, nodePath.node.kind));
    return methodPlace;
}

export { buildObjectMethod };
//# sourceMappingURL=buildObjectMethod.js.map
