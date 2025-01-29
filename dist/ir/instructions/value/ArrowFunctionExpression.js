import { ValueInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

/**
 * Represents an arrow function expression, e.g.
 *   `const arrow = (x) => x + 1;`
 *
 * The `functionIR` property contains the IR for the arrow's body,
 * `async` indicates if it's `async ( ) => { }`,
 * `expression` indicates if it has a concise expression body rather than a block.
 */
class ArrowFunctionExpressionInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    functionIR;
    async;
    expression;
    generator;
    constructor(id, place, nodePath, functionIR, async, expression, generator) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.functionIR = functionIR;
        this.async = async;
        this.expression = expression;
        this.generator = generator;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new ArrowFunctionExpressionInstruction(instructionId, place, this.nodePath, this.functionIR, this.async, this.expression, this.generator);
    }
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [];
    }
    get isPure() {
        return false;
    }
}

export { ArrowFunctionExpressionInstruction };
//# sourceMappingURL=ArrowFunctionExpression.js.map
