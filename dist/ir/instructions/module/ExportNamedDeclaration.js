import { ModuleInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

/**
 * Represents an export named declaration.
 *
 * Example:
 * export { x };
 * export const y = 1;
 */
class ExportNamedDeclarationInstruction extends ModuleInstruction {
    id;
    place;
    nodePath;
    specifiers;
    declaration;
    constructor(id, place, nodePath, specifiers, declaration) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.specifiers = specifiers;
        this.declaration = declaration;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new ExportNamedDeclarationInstruction(instructionId, place, this.nodePath, this.specifiers, this.declaration);
    }
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [
            ...this.specifiers,
            ...(this.declaration ? [this.declaration] : []),
        ];
    }
}

export { ExportNamedDeclarationInstruction };
//# sourceMappingURL=ExportNamedDeclaration.js.map
