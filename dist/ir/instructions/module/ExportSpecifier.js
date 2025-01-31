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
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(ExportSpecifierInstruction, place, this.nodePath, this.local, this.exported);
    }
    rewrite() {
        return this;
    }
    getReadPlaces() {
        return [];
    }
}

export { ExportSpecifierInstruction };
//# sourceMappingURL=ExportSpecifier.js.map
