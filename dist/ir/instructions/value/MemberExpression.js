import { ValueInstruction } from '../../base/Instruction.js';

/**
 * Represents a member expression.
 *
 * Example:
 * a.b
 * a[b]
 */
class MemberExpressionInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    object;
    property;
    computed;
    constructor(id, place, nodePath, object, property, computed) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.object = object;
        this.property = property;
        this.computed = computed;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(MemberExpressionInstruction, place, this.nodePath, this.object, this.property, this.computed);
    }
    rewrite(values) {
        return new MemberExpressionInstruction(this.id, this.place, this.nodePath, values.get(this.object.identifier) ?? this.object, values.get(this.property.identifier) ?? this.property, this.computed);
    }
    getReadPlaces() {
        return [this.object, this.property];
    }
    get isPure() {
        return false;
    }
}

export { MemberExpressionInstruction };
//# sourceMappingURL=MemberExpression.js.map
