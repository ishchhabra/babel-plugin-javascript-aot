import { DeclarationInstruction } from '../../base/Instruction.js';

class FunctionDeclarationInstruction extends DeclarationInstruction {
    id;
    place;
    nodePath;
    params;
    body;
    generator;
    async;
    constructor(id, place, nodePath, params, body, generator, async) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.params = params;
        this.body = body;
        this.generator = generator;
        this.async = async;
    }
    rewriteInstruction(values) {
        return new FunctionDeclarationInstruction(this.id, this.place, this.nodePath, this.params.map((param) => values.get(param.identifier) ?? param), this.body, this.generator, this.async);
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
