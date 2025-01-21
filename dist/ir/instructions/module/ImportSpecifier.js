import { ModuleInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

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
    imported;
    local;
    constructor(id, place, nodePath, imported, local) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.imported = imported;
        this.local = local;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new ImportSpecifierInstruction(instructionId, place, this.nodePath, this.imported, this.local);
    }
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [this.imported, ...(this.local ? [this.local] : [])];
    }
}

export { ImportSpecifierInstruction };
//# sourceMappingURL=ImportSpecifier.js.map
