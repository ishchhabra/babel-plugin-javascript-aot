import { makeInstructionId } from '../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { LoadGlobalInstruction } from '../../ir/instructions/memory/LoadGlobal.js';
import { LoadLocalInstruction } from '../../ir/instructions/memory/LoadLocal.js';
import { BindingIdentifierInstruction } from '../../ir/instructions/BindingIdentifier.js';

/**
 * Builds a place for an identifier. If the identifier is not a variable declarator,
 * a load instruction is created to load the identifier from the scope.
 */
function buildIdentifier(nodePath, builder) {
    if (nodePath.isReferencedIdentifier()) {
        return buildReferencedIdentifier(nodePath, builder);
    }
    else {
        return buildBindingIdentifier(nodePath, builder);
    }
}
function buildBindingIdentifier(nodePath, builder) {
    const name = nodePath.node.name;
    let place;
    // In case we already have a declaration place, we need to use that, so that
    // we're using the place that was created when the binding was discovered
    // in #buildBindings.
    const declarationId = builder.getDeclarationId(name, nodePath);
    if (declarationId !== undefined) {
        place = builder.getLatestDeclarationPlace(declarationId);
    }
    if (place === undefined) {
        const identifier = createIdentifier(builder.environment);
        place = createPlace(identifier, builder.environment);
    }
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    builder.currentBlock.instructions.push(new BindingIdentifierInstruction(instructionId, place, nodePath, name));
    return place;
}
function buildReferencedIdentifier(nodePath, builder) {
    const name = nodePath.node.name;
    const declarationId = builder.getDeclarationId(name, nodePath);
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    if (declarationId === undefined) {
        const binding = nodePath.scope.getBinding(name);
        builder.currentBlock.instructions.push(new LoadGlobalInstruction(instructionId, place, nodePath, name, binding?.kind === "module" ? "import" : "builtin", binding?.kind === "module"
            ? binding.path.parent.source.value
            : undefined));
    }
    else {
        const declarationId = builder.getDeclarationId(name, nodePath);
        if (declarationId === undefined) {
            throw new Error(`Variable accessed before declaration: ${name}`);
        }
        const declarationPlace = builder.getLatestDeclarationPlace(declarationId);
        if (declarationPlace === undefined) {
            throw new Error(`Unable to find the place for ${name} (${declarationId})`);
        }
        builder.currentBlock.instructions.push(new LoadLocalInstruction(instructionId, place, nodePath, declarationPlace));
    }
    return place;
}

export { buildIdentifier };
//# sourceMappingURL=buildIdentifier.js.map
