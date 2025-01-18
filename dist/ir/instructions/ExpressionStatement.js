import { BaseInstruction } from '../base/Instruction.js';

/**
 * Represents an expression statement in the IR.
 *
 * An expression statement is a statement that contains an expression.
 *
 * For example, `x + 1` is an expression statement.
 */
class ExpressionStatementInstruction extends BaseInstruction {
    id;
    place;
    nodePath;
    expression;
    constructor(id, place, nodePath, expression) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.expression = expression;
    }
    rewriteInstruction(values) {
        return new ExpressionStatementInstruction(this.id, this.place, this.nodePath, values.get(this.expression.identifier) ?? this.expression);
    }
    getReadPlaces() {
        return [this.expression];
    }
    get isPure() {
        return false;
    }
}

export { ExpressionStatementInstruction };
//# sourceMappingURL=ExpressionStatement.js.map
