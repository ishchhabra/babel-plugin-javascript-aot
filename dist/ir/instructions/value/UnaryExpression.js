import { ValueInstruction } from '../../base/Instruction.js';

/**
 * Represents a unary expression.
 *
 * Example:
 * !a
 * delete a
 */
class UnaryExpressionInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    operator;
    argument;
    constructor(id, place, nodePath, operator, argument) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.operator = operator;
        this.argument = argument;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(UnaryExpressionInstruction, place, this.nodePath, this.operator, this.argument);
    }
    rewrite(values) {
        return new UnaryExpressionInstruction(this.id, this.place, this.nodePath, this.operator, values.get(this.argument.identifier) ?? this.argument);
    }
    getReadPlaces() {
        return [this.argument];
    }
    get isPure() {
        return ["throw", "delete"].includes(this.operator);
    }
}

export { UnaryExpressionInstruction };
//# sourceMappingURL=UnaryExpression.js.map
