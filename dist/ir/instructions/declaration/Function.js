import { DeclarationInstruction } from '../../base/Instruction.js';

class FunctionDeclarationInstruction extends DeclarationInstruction {
    id;
    place;
    nodePath;
    identifier;
    params;
    functionIR;
    generator;
    async;
    constructor(id, place, nodePath, identifier, params, functionIR, generator, async) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.identifier = identifier;
        this.params = params;
        this.functionIR = functionIR;
        this.generator = generator;
        this.async = async;
    }
    rewriteInstruction(values) {
        return new FunctionDeclarationInstruction(this.id, this.place, this.nodePath, values.get(this.identifier.identifier) ?? this.identifier, this.params.map((param) => values.get(param.identifier) ?? param), this.functionIR, this.generator, this.async);
    }
    getReadPlaces() {
        return this.params;
    }
    get isPure() {
        return false;
    }
}

export { FunctionDeclarationInstruction };
//# sourceMappingURL=Function.js.map
