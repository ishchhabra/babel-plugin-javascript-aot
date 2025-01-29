import { ModuleInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

/**
 * Represents an export specifier.
 *
 * Example:
 * export { x }; // x is the export specifier
 */
class ExportSpecifierInstruction extends ModuleInstruction {
    id;
    place;
    nodePath;
    local;
    exported;
    constructor(id, place, nodePath, local, exported) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.local = local;
        this.exported = exported;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instructionId = createInstructionId(environment);
        return new ExportSpecifierInstruction(instructionId, place, this.nodePath, this.local, this.exported);
    }
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [];
    }
}

export { ExportSpecifierInstruction };
//# sourceMappingURL=ExportSpecifier.js.map
