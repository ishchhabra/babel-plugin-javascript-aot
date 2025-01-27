import { ValueInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

class FunctionExpressionInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    identifier;
    functionIR;
    generator;
    async;
    constructor(id, place, nodePath, identifier, functionIR, generator, async) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.identifier = identifier;
        this.functionIR = functionIR;
        this.generator = generator;
        this.async = async;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new FunctionExpressionInstruction(instructionId, place, this.nodePath, this.identifier, this.functionIR, this.generator, this.async);
    }
    rewriteInstruction(values) {
        return new FunctionExpressionInstruction(this.id, this.place, this.nodePath, values.get(this.identifier.identifier) ?? this.identifier, this.functionIR, this.generator, this.async);
    }
    getReadPlaces() {
        return [this.identifier];
    }
    get isPure() {
        return false;
    }
}

export { FunctionExpressionInstruction };
//# sourceMappingURL=FunctionExpression.js.map
