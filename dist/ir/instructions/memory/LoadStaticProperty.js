import { MemoryInstruction } from '../../base/Instruction.js';

/**
 * An instruction that loads a **static** property for an object:
 * `object[0]` or `object.foo`.
 */
class LoadStaticPropertyInstruction extends MemoryInstruction {
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
        return environment.createInstruction(LoadStaticPropertyInstruction, place, this.nodePath, this.object, this.property);
    }
    rewrite(values) {
        return new LoadStaticPropertyInstruction(this.id, this.place, this.nodePath, values.get(this.object.identifier) ?? this.object, this.property);
    }
    getReadPlaces() {
        return [this.object];
    }
    get isPure() {
        return false;
    }
}

export { LoadStaticPropertyInstruction };
//# sourceMappingURL=LoadStaticProperty.js.map
