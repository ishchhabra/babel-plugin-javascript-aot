import { ValueInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

/**
 * Represents a literal value.
 *
 * Example:
 * 42
 * "hello"
 * true
 */
class LiteralInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    value;
    constructor(id, place, nodePath, value) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.value = value;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new LiteralInstruction(instructionId, place, this.nodePath, this.value);
    }
    rewriteInstruction() {
        // Literals can not be rewritten.
        return this;
    }
    getReadPlaces() {
        return [];
    }
    get isPure() {
        return true;
    }
}

export { LiteralInstruction };
//# sourceMappingURL=Literal.js.map
