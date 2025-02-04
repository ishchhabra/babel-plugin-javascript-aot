import { MemoryInstruction } from '../../base/Instruction.js';

/**
 * An instruction that stores a value into a **static** property for an object:
 * `object[0]` or `object.foo`.
 */
class StoreStaticPropertyInstruction extends MemoryInstruction {
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
        return environment.createInstruction(StoreStaticPropertyInstruction, place, this.nodePath, this.object, this.property, this.value);
    }
    rewrite(values) {
        return new StoreStaticPropertyInstruction(this.id, this.place, this.nodePath, values.get(this.object.identifier) ?? this.object, this.property, values.get(this.value.identifier) ?? this.value);
    }
    getReadPlaces() {
        return [this.object, this.value];
    }
    get isPure() {
        return false;
    }
}

export { StoreStaticPropertyInstruction };
//# sourceMappingURL=StoreStaticProperty.js.map
