import { ValueInstruction } from '../../base/Instruction.js';

/**
 * Represents an object method in the IR.
 *
 * Examples:
 * - `{ foo() {} } // foo is the object method`
 */
class ObjectMethodInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    key;
    body;
    computed;
    generator;
    async;
    kind;
    constructor(id, place, nodePath, key, body, computed, generator, async, kind) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.key = key;
        this.body = body;
        this.computed = computed;
        this.generator = generator;
        this.async = async;
        this.kind = kind;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(ObjectMethodInstruction, place, this.nodePath, this.key, this.body, this.computed, this.generator, this.async, this.kind);
    }
    rewrite(values) {
        return new ObjectMethodInstruction(this.id, this.place, this.nodePath, values.get(this.key.identifier) ?? this.key, this.body, this.computed, this.generator, this.async, this.kind);
    }
    getReadPlaces() {
        return [this.key];
    }
}

export { ObjectMethodInstruction };
//# sourceMappingURL=ObjectMethod.js.map
