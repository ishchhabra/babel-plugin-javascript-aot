import { BaseInstruction } from '../base/Instruction.js';
import { createIdentifier, createPlace, createInstructionId } from '../utils.js';

/**
 * Represents a binding identifier in the IR.
 *
 * A binding identifier is used when declaring new identifiers that are not already
 * in context. This differs from a load instruction which references existing identifiers.
 *
 * Examples:
 * - Variable declarations: `let x = 10` - "x" is a binding identifier
 * - Import declarations: `import { x } from "y"` - "x" is a binding identifier
 * - Function parameters: `function f(x) {}` - "x" is a binding identifier
 */
class BindingIdentifierInstruction extends BaseInstruction {
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
        return new BindingIdentifierInstruction(instructionId, place, this.nodePath, this.name);
    }
    rewriteInstruction() {
        return this;
    }
    getReadPlaces() {
        return [];
    }
}

export { BindingIdentifierInstruction };
//# sourceMappingURL=BindingIdentifier.js.map
