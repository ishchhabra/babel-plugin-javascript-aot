import { ModuleInstruction } from '../../base/Instruction.js';

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
