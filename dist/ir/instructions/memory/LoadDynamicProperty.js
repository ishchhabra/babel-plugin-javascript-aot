import { MemoryInstruction } from '../../base/Instruction.js';

/**
 * An instruction that loads a **dynamic** property for an object:
 * `object[property]`.
 */
class LoadDynamicPropertyInstruction extends MemoryInstruction {
    id;
    place;
    nodePath;
    object;
    property;
    constructor(id, place, nodePath, object, property) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.object = object;
        this.property = property;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(LoadDynamicPropertyInstruction, place, this.nodePath, this.object, this.property);
    }
    rewrite(values) {
        return new LoadDynamicPropertyInstruction(this.id, this.place, this.nodePath, values.get(this.object.identifier) ?? this.object, values.get(this.property.identifier) ?? this.property);
    }
    getReadPlaces() {
        return [this.object, this.property];
    }
    get isPure() {
        return false;
    }
}

export { LoadDynamicPropertyInstruction };
//# sourceMappingURL=LoadDynamicProperty.js.map
