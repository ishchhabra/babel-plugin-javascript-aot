import { BaseInstruction } from '../base/Instruction.js';

/**
 * Represents a node that is not supported by the IR. This is used to bail out
 * when we encounter a node that we don't know how to handle.
 *
 * Example:
 * let x = { y: z }
 */
class UnsupportedNodeInstruction extends BaseInstruction {
    id;
    place;
    nodePath;
    node;
    constructor(id, place, nodePath, node) {
        super(id, place, nodePath);
        this.id = id;
        this.place = place;
        this.nodePath = nodePath;
        this.node = node;
    }
    rewriteInstruction(values) {
        for (const [identifier, place] of values) {
            // The only other place we're renaming is in the binding phase of the
            // HIR Builder. So, when we rename here, we need to use the declaration
            // name of the identifier that we're renaming.
            // Since by definition, there can only be one phi node for a variable
            // in a block, it is safe to do this.
            const oldName = `$${identifier.declarationId}_0`;
            const newName = place.identifier.name;
            this.nodePath?.scope.rename(oldName, newName);
        }
        return this;
    }
    getReadPlaces() {
        throw new Error("Unable to get read places for unsupported node");
    }
    get isPure() {
        return false;
    }
}

export { UnsupportedNodeInstruction };
//# sourceMappingURL=UnsupportedNode.js.map
