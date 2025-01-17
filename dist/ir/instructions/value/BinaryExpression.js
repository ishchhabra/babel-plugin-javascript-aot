import { ValueInstruction } from '../../base/Instruction.js';

/**
 * Represents a binary expression.
 *
 * Example:
 * 1 + 2
 */
class BinaryExpressionInstruction extends ValueInstruction {
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
    rewriteInstruction(values) {
        return new BinaryExpressionInstruction(this.id, this.place, this.nodePath, this.operator, values.get(this.left.identifier) ?? this.left, values.get(this.right.identifier) ?? this.right);
    }
    getReadPlaces() {
        return [this.left, this.right];
    }
    get isPure() {
        return true;
    }
}

export { BinaryExpressionInstruction };
//# sourceMappingURL=BinaryExpression.js.map
