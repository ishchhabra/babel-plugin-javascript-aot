import { ModuleInstruction } from '../../base/Instruction.js';

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
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [this.imported, ...(this.local ? [this.local] : [])];
    }
}

export { ImportSpecifierInstruction };
//# sourceMappingURL=ImportSpecifier.js.map
