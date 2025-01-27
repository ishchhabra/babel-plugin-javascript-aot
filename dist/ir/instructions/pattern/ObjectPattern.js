import { PatternInstruction } from '../../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../../utils.js';

/**
 * Represents an object pattern in the IR.
 *
 * Examples:
 * - `const { x, y } = { x: 1, y: 2 } // { x, y } is the object pattern`
 */
class ObjectPatternInstruction extends PatternInstruction {
    id;
    place;
    nodePath;
    properties;
    constructor(id, place, nodePath, properties) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.properties = properties;
    }
    clone(environment) {
        const identifier = createIdentifier(environment);
        const place = createPlace(identifier, environment);
        const instructionId = createInstructionId(environment);
        return new ObjectPatternInstruction(instructionId, place, this.nodePath, this.properties);
    }
    rewriteInstruction(values) {
        return new ObjectPatternInstruction(this.id, this.place, this.nodePath, this.properties.map((property) => values.get(property.identifier) ?? property));
    }
    getReadPlaces() {
        return this.properties;
    }
}

export { ObjectPatternInstruction };
//# sourceMappingURL=ObjectPattern.js.map
