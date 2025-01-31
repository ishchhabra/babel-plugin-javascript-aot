import { MemoryInstruction } from '../../base/Instruction.js';

class LoadPhiInstruction extends MemoryInstruction {
    id;
    place;
    nodePath;
    value;
    constructor(id, place, nodePath, value) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.value = value;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(LoadPhiInstruction, place, this.nodePath, this.value);
    }
    rewrite(values) {
        return new LoadPhiInstruction(this.id, this.place, this.nodePath, values.get(this.value.identifier) ?? this.value);
    }
    getReadPlaces() {
        return [this.value];
    }
    get isPure() {
        return true;
    }
}

export { LoadPhiInstruction };
//# sourceMappingURL=LoadPhi.js.map
