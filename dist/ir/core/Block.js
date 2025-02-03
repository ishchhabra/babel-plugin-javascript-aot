/**
 * Simulated opaque type for BlockId to prevent using normal numbers as ids
 * accidentally.
 */
function makeBlockId(id) {
    return id;
}
class BasicBlock {
    id;
    instructions;
    terminal;
    constructor(id, instructions, terminal) {
        this.id = id;
        this.instructions = instructions;
        this.terminal = terminal;
    }
}

export { BasicBlock, makeBlockId };
//# sourceMappingURL=Block.js.map
