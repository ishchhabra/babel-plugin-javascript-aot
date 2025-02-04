import { BaseInstruction } from '../base/Instruction.js';

/**
 * Represents a rest element in the IR.
 *
 * Examples:
 * - const [a, ...b] = [1, 2, 3, 4, 5];
 */
class RestElementInstruction extends BaseInstruction {
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
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(RestElementInstruction, place, this.nodePath, this.argument);
    }
    rewrite(values) {
        return new RestElementInstruction(this.id, this.place, this.nodePath, values.get(this.argument.identifier) ?? this.argument);
    }
    getReadPlaces() {
        return [this.argument];
    }
    get isPure() {
        return true;
    }
}

export { RestElementInstruction };
//# sourceMappingURL=RestElement.js.map
