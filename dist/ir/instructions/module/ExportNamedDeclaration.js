import { ModuleInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

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
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
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
