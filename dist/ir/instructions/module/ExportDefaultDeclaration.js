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
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(ExportDefaultDeclarationInstruction, place, this.nodePath, this.declaration);
    }
    rewrite() {
        return this;
    }
    getReadPlaces() {
        return [this.declaration];
    }
}

export { ExportDefaultDeclarationInstruction };
//# sourceMappingURL=ExportDefaultDeclaration.js.map
