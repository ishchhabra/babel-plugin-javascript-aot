import { MemoryInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

/**
 * Represents a memory instruction that loads a value for a global variable to a place.
 *
 * For example, when `console.log` is referenced, its value needs to be loaded from the global scope
 * before it can be used.
 */
class LoadGlobalInstruction extends MemoryInstruction {
    id;
    place;
    nodePath;
    name;
    constructor(id, place, nodePath, name) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.name = name;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new LoadGlobalInstruction(instructionId, place, this.nodePath, this.name);
    }
    rewriteInstruction() {
        // LoadGlobal can not be rewritten.
        return this;
    }
    getReadPlaces() {
        return [];
    }
    get isPure() {
        return false;
    }
}

export { LoadGlobalInstruction };
//# sourceMappingURL=LoadGlobal.js.map
