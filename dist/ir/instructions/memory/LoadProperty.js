import { MemoryInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

/**
 * An instruction that loads a **static** property for an object:
 * `object[0]` or `object.foo`.
 */
class LoadPropertyInstruction extends MemoryInstruction {
    id;
    place;
    nodePath;
    object;
    property;
    constructor(id, place, nodePath, object, property) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.object = object;
        this.property = property;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new LoadPropertyInstruction(instructionId, place, this.nodePath, this.object, this.property);
    }
    rewriteInstruction(values) {
        return new LoadPropertyInstruction(this.id, this.place, this.nodePath, values.get(this.object.identifier) ?? this.object, this.property);
    }
    getReadPlaces() {
        return [this.object];
    }
    get isPure() {
        return false;
    }
}

export { LoadPropertyInstruction };
//# sourceMappingURL=LoadProperty.js.map
