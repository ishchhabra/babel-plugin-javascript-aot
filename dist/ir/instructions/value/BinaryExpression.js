import { ValueInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

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
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instructionId = createInstructionId(environment);
        return new BinaryExpressionInstruction(instructionId, place, this.nodePath, this.operator, this.left, this.right);
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
