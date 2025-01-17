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
    params;
    body;
    computed;
    generator;
    async;
    kind;
    constructor(id, place, nodePath, key, params, body, computed, generator, async, kind) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.key = key;
        this.params = params;
        this.body = body;
        this.computed = computed;
        this.generator = generator;
        this.async = async;
        this.kind = kind;
    }
    rewriteInstruction(values) {
        return new ObjectMethodInstruction(this.id, this.place, this.nodePath, values.get(this.key.identifier) ?? this.key, this.params.map((param) => values.get(param.identifier) ?? param), this.body, this.computed, this.generator, this.async, this.kind);
    }
    getReadPlaces() {
        return [this.key, ...this.params];
    }
}

export { ObjectMethodInstruction };
//# sourceMappingURL=ObjectMethod.js.map
