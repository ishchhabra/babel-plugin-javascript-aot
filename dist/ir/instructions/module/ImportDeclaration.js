import { ModuleInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

/**
 * Represents an import declaration.
 *
 * Example:
 * import x from "y";
 * import { x } from "y";
 */
class ImportDeclarationInstruction extends ModuleInstruction {
    id;
    place;
    nodePath;
    source;
    resolvedSource;
    specifiers;
    constructor(id, place, nodePath, source, resolvedSource, specifiers) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.source = source;
        this.resolvedSource = resolvedSource;
        this.specifiers = specifiers;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instructionId = createInstructionId(environment);
        return new ImportDeclarationInstruction(instructionId, place, this.nodePath, this.source, this.resolvedSource, this.specifiers);
    }
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [...this.specifiers];
    }
}

export { ImportDeclarationInstruction };
//# sourceMappingURL=ImportDeclaration.js.map
