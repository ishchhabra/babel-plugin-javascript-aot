import { ValueInstruction } from '../../base/Instruction.js';

/**
 * Represents an object expression.
 *
 * Example:
 * { a: 1, b: 2 }
 */
class ObjectExpressionInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    properties;
    constructor(id, place, nodePath, properties) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.properties = properties;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(ObjectExpressionInstruction, place, this.nodePath, this.properties);
    }
    rewrite(values) {
        return new ObjectExpressionInstruction(this.id, this.place, this.nodePath, this.properties.map((property) => values.get(property.identifier) ?? property));
    }
    getReadPlaces() {
        return this.properties;
    }
    get isPure() {
        return true;
    }
}

export { ObjectExpressionInstruction };
//# sourceMappingURL=ObjectExpression.js.map
