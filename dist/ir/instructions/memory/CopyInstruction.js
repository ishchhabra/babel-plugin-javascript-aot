import { MemoryInstruction } from '../../base/Instruction.js';

/**
 * Represents a memory instruction that copies the value of one place to another.
 *
 * For example, Copy(lval: x, value: y) means that the value at place y is copied to x.
 */
class CopyInstruction extends MemoryInstruction {
    id;
    place;
    nodePath;
    lval;
    value;
    constructor(id, place, nodePath, lval, value) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.lval = lval;
        this.value = value;
    }
    rewriteInstruction(values) {
        return new CopyInstruction(this.id, this.place, this.nodePath, values.get(this.lval.identifier) ?? this.lval, values.get(this.value.identifier) ?? this.value);
    }
    getReadPlaces() {
        return [this.lval, this.value];
    }
    get isPure() {
        return true;
    }
}

export { CopyInstruction };
//# sourceMappingURL=CopyInstruction.js.map