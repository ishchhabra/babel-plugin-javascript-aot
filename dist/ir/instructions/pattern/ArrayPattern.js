import { PatternInstruction } from '../../base/Instruction.js';

/**
 * Represents an array pattern in the IR.
 *
 * Examples:
 * - `const [x, y] = [1, 2] // [x, y] is the array pattern`
 */
class ArrayPatternInstruction extends PatternInstruction {
    id;
    place;
    nodePath;
    elements;
    constructor(id, place, nodePath, elements) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.elements = elements;
    }
    rewriteInstruction(values) {
        return new ArrayPatternInstruction(this.id, this.place, this.nodePath, this.elements.map((element) => values.get(element.identifier) ?? element));
    }
    getReadPlaces() {
        return this.elements;
    }
    get isPure() {
        return true;
    }
}

export { ArrayPatternInstruction };
//# sourceMappingURL=ArrayPattern.js.map
