import { PatternInstruction } from '../../base/Instruction.js';

/**
 * Represents an assignment pattern with a default value.
 *
 * Examples:
 * - `function foo(a = 1)` - Parameter default value
 * - `const {x = 1} = obj` - Destructuring with default value
 */
class AssignmentPatternInstruction extends PatternInstruction {
    id;
    place;
    nodePath;
    left;
    right;
    constructor(id, place, nodePath, left, right) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.left = left;
        this.right = right;
    }
    clone(environment) {
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        return environment.createInstruction(AssignmentPatternInstruction, place, this.nodePath, this.left, this.right);
    }
    rewrite(values) {
        return new AssignmentPatternInstruction(this.id, this.place, this.nodePath, values.get(this.left.identifier) ?? this.left, values.get(this.right.identifier) ?? this.right);
    }
    getReadPlaces() {
        return [this.left, this.right];
    }
    get isPure() {
        return true;
    }
}

export { AssignmentPatternInstruction };
//# sourceMappingURL=AssignmentPattern.js.map
