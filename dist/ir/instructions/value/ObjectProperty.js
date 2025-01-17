import { ValueInstruction } from '../../base/Instruction.js';

/**
 * Represents an object property in the IR.
 *
 * Examples:
 * - `{ x: 1, y: 2 } // `x: 1` and `y: 2` are the object properties
 */
class ObjectPropertyInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    key;
    value;
    computed;
    shorthand;
    constructor(id, place, nodePath, key, value, computed, shorthand) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.key = key;
        this.value = value;
        this.computed = computed;
        this.shorthand = shorthand;
    }
    rewriteInstruction(values) {
        return new ObjectPropertyInstruction(this.id, this.place, this.nodePath, values.get(this.key.identifier) ?? this.key, values.get(this.value.identifier) ?? this.value, this.computed, this.shorthand);
    }
    getReadPlaces() {
        return [this.key, this.value];
    }
}

export { ObjectPropertyInstruction };
//# sourceMappingURL=ObjectProperty.js.map
