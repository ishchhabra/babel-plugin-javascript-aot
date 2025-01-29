import { MemoryInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

/**
 * An instruction that stores a value into a **static** property for an object:
 * `object[0]` or `object.foo`.
 */
class StorePropertyInstruction extends MemoryInstruction {
    id;
    place;
    nodePath;
    object;
    property;
    value;
    constructor(id, place, nodePath, object, property, value) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.object = object;
        this.property = property;
        this.value = value;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instructionId = createInstructionId(environment);
        return new StorePropertyInstruction(instructionId, place, this.nodePath, this.object, this.property, this.value);
    }
    rewriteInstruction(values) {
        return new StorePropertyInstruction(this.id, this.place, this.nodePath, values.get(this.object.identifier) ?? this.object, this.property, values.get(this.value.identifier) ?? this.value);
    }
    getReadPlaces() {
        return [this.object, this.value];
    }
    get isPure() {
        return false;
    }
}

export { StorePropertyInstruction };
//# sourceMappingURL=StoreProperty.js.map
