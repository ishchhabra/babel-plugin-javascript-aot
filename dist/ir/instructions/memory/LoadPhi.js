import { MemoryInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

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
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new LoadPhiInstruction(instructionId, place, this.nodePath, this.value);
    }
    rewriteInstruction(values) {
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
