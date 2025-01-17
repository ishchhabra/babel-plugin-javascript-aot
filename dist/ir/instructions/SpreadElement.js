import { BaseInstruction } from '../base/Instruction.js';

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
