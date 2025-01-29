import { ModuleInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

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
        const instructionId = createInstructionId(environment);
        return new ExportDefaultDeclarationInstruction(instructionId, place, this.nodePath, this.declaration);
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
