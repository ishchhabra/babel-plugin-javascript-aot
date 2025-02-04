import { ValueInstruction } from '../../base/Instruction.js';
import { createInstructionId } from '../../utils.js';

/**
 * Represents a hole - an empty or missing value in an array.
 *
 * Example:
 * [1, , 3] // Second element is a hole
 */
class HoleInstruction extends ValueInstruction {
    id;
    place;
    nodePath;
    constructor(id, place, nodePath) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instructionId = createInstructionId(environment);
        return new HoleInstruction(instructionId, place, this.nodePath);
    }
    rewrite() {
        // Hole can not be rewritten.
        return this;
    }
    getReadPlaces() {
        return [];
    }
    get isPure() {
        return true;
    }
}

export { HoleInstruction };
//# sourceMappingURL=Hole.js.map
