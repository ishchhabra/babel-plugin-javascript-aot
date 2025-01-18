import { ModuleInstruction } from '../../base/Instruction.js';

/**
 * Represents an export default declaration.
 *
 * Example:
 * export default x;
 */
class ExportDefaultDeclarationInstruction extends ModuleInstruction {
    id;
    place;
    nodePath;
    declaration;
    constructor(id, place, nodePath, declaration) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.declaration = declaration;
    }
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [this.declaration];
    }
}

export { ExportDefaultDeclarationInstruction };
//# sourceMappingURL=ExportDefaultDeclaration.js.map
