import { ValueInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

/**
 * Represents a call expression.
 *
 * Example:
 * foo(1, 2)
 */
class CallExpressionInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    callee;
    args;
    constructor(id, place, nodePath, callee, 
    // Using args instead of arguments since arguments is a reserved word
    args) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.callee = callee;
        this.args = args;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instructionId = createInstructionId(environment);
        return new CallExpressionInstruction(instructionId, place, this.nodePath, this.callee, this.args);
    }
    rewriteInstruction(values) {
        return new CallExpressionInstruction(this.id, this.place, this.nodePath, values.get(this.callee.identifier) ?? this.callee, this.args.map((arg) => values.get(arg.identifier) ?? arg));
    }
    getReadPlaces() {
        return [this.callee, ...this.args];
    }
    get isPure() {
        return false;
    }
}

export { CallExpressionInstruction };
//# sourceMappingURL=CallExpression.js.map
