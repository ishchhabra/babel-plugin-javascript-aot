import { makeInstructionId } from '../../ir/base/Instruction.js';
import { createIdentifier, createPlace } from '../../ir/utils.js';
import { LoadGlobalInstruction } from '../../ir/instructions/memory/LoadGlobal.js';
import { LoadLocalInstruction } from '../../ir/instructions/memory/LoadLocal.js';
import { BindingIdentifierInstruction } from '../../ir/instructions/BindingIdentifier.js';

/**
 * Builds a place for an identifier. If the identifier is not a variable declarator,
 * a load instruction is created to load the identifier from the scope. Otherwise,
 * a binding instruction is created.
 *
 * @param nodePath - The Babel NodePath for the identifier
 * @param builder - The FunctionIRBuilder managing IR state
 * @param options.declInstrPlace - If provided, the place is recoded in the
 * environment's `declToDeclInstrPlace` mapping as the "declaration instruction
 * place" for this identifier's `DeclarationId`. In other words, if `declInstrPlace`
 * is set, the newly created or updated declaration place for this identifier is
 * associated with the provided instruction place in the IR, allowing
 * multi-declaration statements (e.g. `const a=1,b=2`) or subsequent exports
 * to reference this higher-level statement/instruction.
 *
 * @returns The `Place` representing this identifier in the IR
 */
function buildIdentifier(nodePath, builder, { declInstrPlace } = {}) {
    if (nodePath.isReferencedIdentifier()) {
        return buildReferencedIdentifier(nodePath, builder);
    }
    else {
        return buildBindingIdentifier(nodePath, builder, {
            declInstrPlace,
        });
    }
}
function buildBindingIdentifier(nodePath, builder, { declInstrPlace }) {
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
    builder.addInstruction(new BindingIdentifierInstruction(instructionId, place, nodePath, name));
    if (declInstrPlace !== undefined) {
        builder.environment.declToDeclInstrPlace.set(place.identifier.declarationId, declInstrPlace.id);
    }
    return place;
}
function buildReferencedIdentifier(nodePath, builder) {
    const name = nodePath.node.name;
    const declarationId = builder.getDeclarationId(name, nodePath);
    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instructionId = makeInstructionId(builder.environment.nextInstructionId++);
    if (declarationId === undefined) {
        builder.addInstruction(new LoadGlobalInstruction(instructionId, place, nodePath, name));
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
        builder.addInstruction(new LoadLocalInstruction(instructionId, place, nodePath, declarationPlace));
    }
    return place;
}

export { buildIdentifier };
//# sourceMappingURL=buildIdentifier.js.map
