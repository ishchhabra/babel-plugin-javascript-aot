import { ValueInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

/**
 * Represents an array expression.
 *
 * Example:
 * [1, 2, 3]
 */
class ArrayExpressionInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    elements;
    constructor(id, place, nodePath, elements) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.elements = elements;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instructionId = createInstructionId(environment);
        return new ArrayExpressionInstruction(instructionId, place, this.nodePath, this.elements);
    }
    rewriteInstruction(values) {
        return new ArrayExpressionInstruction(this.id, this.place, this.nodePath, this.elements.map((element) => values.get(element.identifier) ?? element));
    }
    getReadPlaces() {
        return this.elements;
    }
    get isPure() {
        return true;
    }
}

export { ArrayExpressionInstruction };
//# sourceMappingURL=ArrayExpression.js.map
