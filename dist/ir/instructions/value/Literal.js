import { ValueInstruction } from '../../base/Instruction.js';

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
