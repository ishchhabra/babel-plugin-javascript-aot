import { makeInstructionId } from '../../ir/base/Instruction.js';
import { ObjectMethodInstruction } from '../../ir/instructions/value/ObjectMethod.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { buildBindings } from './bindings/buildBindings.js';
import { buildNode } from './buildNode.js';
import { FunctionIRBuilder } from './FunctionIRBuilder.js';

function buildObjectMethod(nodePath, functionBuilder, moduleBuilder) {
    // Build the key place
    const keyPath = nodePath.get("key");
    const keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder);
    if (keyPlace === undefined || Array.isArray(keyPlace)) {
        throw new Error(`Unable to build key place for ${nodePath.type}`);
    }
    buildBindings(nodePath, functionBuilder);
    const params = nodePath.get("params");
    const paramPlaces = params.map((param) => {
        if (!param.isIdentifier()) {
            throw new Error(`Unsupported parameter type: ${param.type}`);
        }
        const declarationId = functionBuilder.getDeclarationId(param.node.name, nodePath);
        if (declarationId === undefined) {
            throw new Error(`Variable accessed before declaration: ${param.node.name}`);
        }
        const place = functionBuilder.getLatestDeclarationPlace(declarationId);
        if (place === undefined) {
            throw new Error(`Unable to find the place for ${param.node.name}`);
        }
        return place;
    });
    const bodyPath = nodePath.get("body");
    const bodyIR = new FunctionIRBuilder(bodyPath, functionBuilder.environment, moduleBuilder, paramPlaces).build();
    const methodIdentifier = createIdentifier(functionBuilder.environment);
    const methodPlace = createPlace(methodIdentifier, functionBuilder.environment);
    const methodInstructionId = makeInstructionId(functionBuilder.environment.nextInstructionId++);
    functionBuilder.currentBlock.instructions.push(new ObjectMethodInstruction(methodInstructionId, methodPlace, nodePath, keyPlace, bodyIR, nodePath.node.computed, nodePath.node.generator, nodePath.node.async, nodePath.node.kind));
    return methodPlace;
}

export { buildObjectMethod };
//# sourceMappingURL=buildObjectMethod.js.map
