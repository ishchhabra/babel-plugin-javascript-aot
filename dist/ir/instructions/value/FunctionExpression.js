import { ValueInstruction } from '../../base/Instruction.js';

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
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(FunctionExpressionInstruction, place, this.nodePath, this.identifier, this.functionIR, this.generator, this.async);
    }
    rewrite(values) {
        return new FunctionExpressionInstruction(this.id, this.place, this.nodePath, this.identifier
            ? (values.get(this.identifier.identifier) ?? this.identifier)
            : null, this.functionIR, this.generator, this.async);
    }
    getReadPlaces() {
        return [...(this.identifier ? [this.identifier] : [])];
    }
    get isPure() {
        return false;
    }
}

export { FunctionExpressionInstruction };
//# sourceMappingURL=FunctionExpression.js.map
