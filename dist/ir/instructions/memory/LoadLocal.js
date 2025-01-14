import { MemoryInstruction } from '../../base/Instruction.js';

/**
 * Represents an instruction that loads a value from one place to another place.
 * This is used to move values between different memory locations in the IR.
 *
 * For example, when a variable is referenced, its value needs to be loaded from its storage location
 * to the place where it's being used.
 */
class LoadLocalInstruction extends MemoryInstruction {
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
    rewriteInstruction(values) {
        const rewrittenTarget = values.get(this.value.identifier) ?? this.value;
        if (rewrittenTarget === this.value) {
            return this;
        }
        return new LoadLocalInstruction(this.id, this.place, this.nodePath, rewrittenTarget);
    }
    getReadPlaces() {
        return [this.value];
    }
    get isPure() {
        return true;
    }
}

export { LoadLocalInstruction };
//# sourceMappingURL=LoadLocal.js.map
