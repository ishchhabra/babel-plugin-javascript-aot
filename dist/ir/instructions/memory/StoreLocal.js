import { MemoryInstruction } from '../../base/Instruction.js';

/**
 * Represents a memory instruction that stores a value at a given place.
 *
 * @example
 * ```typescript
 * const x = 5;
 * ```
 */
class StoreLocalInstruction extends MemoryInstruction {
    id;
    place;
    nodePath;
    lval;
    value;
    type;
    constructor(id, place, nodePath, lval, value, type) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.lval = lval;
        this.value = value;
        this.type = type;
    }
    rewriteInstruction(values) {
        return new StoreLocalInstruction(this.id, this.place, this.nodePath, this.lval, values.get(this.value.identifier) ?? this.value, this.type);
    }
    getReadPlaces() {
        return [this.value];
    }
    get isPure() {
        return true;
    }
}

export { StoreLocalInstruction };
//# sourceMappingURL=StoreLocal.js.map