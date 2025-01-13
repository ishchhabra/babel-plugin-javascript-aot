import { makeInstructionId } from '../../ir/base/Instruction.js';
import { JumpTerminal } from '../../ir/core/Terminal.js';
import { ObjectMethodInstruction } from '../../ir/instructions/value/ObjectMethod.js';
import { createBlock, createIdentifier, createPlace } from '../../ir/utils.js';
import { buildBindings } from './bindings/buildBindings.js';
import { buildNode } from './buildNode.js';

function buildObjectMethod(nodePath, builder) {
    const currentBlock = builder.currentBlock;
    // Build the key place
    const keyPath = nodePath.get("key");
    const keyPlace = buildNode(keyPath, builder);
    if (keyPlace === undefined) {
        throw new Error(`Unable to build key place for ${nodePath.type}`);
    }
    // Build the body block.
    const bodyBlock = createBlock(builder.environment);
    builder.blocks.set(bodyBlock.id, bodyBlock);
    builder.currentBlock = bodyBlock;
    buildBindings(nodePath, builder);
    const params = nodePath.get("params");
    const paramPlaces = params.map((param) => {
        if (!param.isIdentifier()) {
            throw new Error(`Unsupported parameter type: ${param.type}`);
        }
        const declarationId = builder.getDeclarationId(param.node.name, nodePath);
        if (declarationId === undefined) {
            throw new Error(`Variable accessed before declaration: ${param.node.name}`);
        }
        const place = builder.getLatestDeclarationPlace(declarationId);
        if (place === undefined) {
            throw new Error(`Unable to find the place for ${param.node.name}`);
        }
        return place;
    });
    const bodyPath = nodePath.get("body");
    builder.currentBlock = bodyBlock;
    buildNode(bodyPath, builder);
    const methodIdentifier = createIdentifier(builder.environment);
    const methodPlace = createPlace(methodIdentifier, builder.environment);
    const methodInstructionId = makeInstructionId(builder.environment.nextInstructionId++);
    currentBlock.instructions.push(new ObjectMethodInstruction(methodInstructionId, methodPlace, nodePath, keyPlace, paramPlaces, bodyBlock.id, nodePath.node.computed, nodePath.node.generator, nodePath.node.async, nodePath.node.kind));
    // Set the terminal for the current block.
    currentBlock.terminal = new JumpTerminal(makeInstructionId(builder.environment.nextInstructionId++), bodyBlock.id);
    builder.currentBlock = currentBlock;
    return methodPlace;
}

export { buildObjectMethod };
//# sourceMappingURL=buildObjectMethod.js.map
