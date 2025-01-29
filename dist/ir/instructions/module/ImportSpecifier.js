import { ModuleInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

/**
 * Represents an import specifier.
 *
 * Example:
 * import { x } from "y"; // x is the import specifier
 */
class ImportSpecifierInstruction extends ModuleInstruction {
    id;
    place;
    nodePath;
    local;
    imported;
    constructor(id, place, nodePath, local, imported) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.local = local;
        this.imported = imported;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instructionId = createInstructionId(environment);
        return new ImportSpecifierInstruction(instructionId, place, this.nodePath, this.local, this.imported);
    }
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [];
    }
}

export { ImportSpecifierInstruction };
//# sourceMappingURL=ImportSpecifier.js.map
