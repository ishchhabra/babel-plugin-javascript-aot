import { ModuleInstruction } from '../../base/Instruction.js';

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
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [this.local];
    }
}

export { ExportSpecifierInstruction };
//# sourceMappingURL=ExportSpecifier.js.map
