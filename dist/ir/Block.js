/**
 * Simulated opaque type for BlockId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueBlockId = Symbol();
export function makeBlockId(id) {
    return id;
}
export class BasicBlock {
    id;
    instructions;
    terminal;
    constructor(id, instructions, terminal) {
        this.id = id;
        this.instructions = instructions;
        this.terminal = terminal;
    }
}
//# sourceMappingURL=Block.js.map