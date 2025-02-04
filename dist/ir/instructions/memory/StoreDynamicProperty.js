import { MemoryInstruction } from '../../base/Instruction.js';

/**
 * An instruction that stores a value into a **dynamic** property for an object:
 * `object[property]`.
 */
class StoreDynamicPropertyInstruction extends MemoryInstruction {
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
        return environment.createInstruction(StoreDynamicPropertyInstruction, place, this.nodePath, this.object, this.property, this.value);
    }
    rewrite(values) {
        return new StoreDynamicPropertyInstruction(this.id, this.place, this.nodePath, values.get(this.object.identifier) ?? this.object, values.get(this.property.identifier) ?? this.property, values.get(this.value.identifier) ?? this.value);
    }
    getReadPlaces() {
        return [this.object, this.property, this.value];
    }
    get isPure() {
        return false;
    }
}

export { StoreDynamicPropertyInstruction };
//# sourceMappingURL=StoreDynamicProperty.js.map
