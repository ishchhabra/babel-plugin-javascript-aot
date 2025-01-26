import { BaseInstruction } from '../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../utils.js';

/**
 * Represents a spread element in the IR.
 *
 * Examples:
 * - `...foo`
 * - `...[1, 2, 3]`
 */
class SpreadElementInstruction extends BaseInstruction {
    id;
    place;
    nodePath;
    argument;
    constructor(id, place, nodePath, argument) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.argument = argument;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new SpreadElementInstruction(instructionId, place, this.nodePath, this.argument);
    }
    rewriteInstruction(values) {
        return new SpreadElementInstruction(this.id, this.place, this.nodePath, values.get(this.argument.identifier) ?? this.argument);
    }
    getReadPlaces() {
        return [this.argument];
    }
    get isPure() {
        return true;
    }
}

export { SpreadElementInstruction };
//# sourceMappingURL=SpreadElement.js.map
