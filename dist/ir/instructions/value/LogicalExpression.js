import { ValueInstruction } from '../../base/Instruction.js';

/**
 * Represents a logical expression.
 *
 * Example:
 * a && b
 * a || b
 */
class LogicalExpressionInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    operator;
    left;
    right;
    constructor(id, place, nodePath, operator, left, right) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(LogicalExpressionInstruction, place, this.nodePath, this.operator, this.left, this.right);
    }
    rewrite(values) {
        return new LogicalExpressionInstruction(this.id, this.place, this.nodePath, this.operator, values.get(this.left.identifier) ?? this.left, values.get(this.right.identifier) ?? this.right);
    }
    getReadPlaces() {
        return [this.left, this.right];
    }
    get isPure() {
        return false;
    }
}

export { LogicalExpressionInstruction };
//# sourceMappingURL=LogicalExpression.js.map
