import { DeclarationInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

class FunctionDeclarationInstruction extends DeclarationInstruction {
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
        const instructionId = createInstructionId(environment);
        return new FunctionDeclarationInstruction(instructionId, place, this.nodePath, this.identifier, this.functionIR, this.generator, this.async);
    }
    rewriteInstruction(values) {
        return new FunctionDeclarationInstruction(this.id, this.place, this.nodePath, values.get(this.identifier.identifier) ?? this.identifier, this.functionIR, this.generator, this.async);
    }
    getReadPlaces() {
        return [this.identifier];
    }
    get isPure() {
        return false;
    }
}

export { FunctionDeclarationInstruction };
//# sourceMappingURL=Function.js.map
