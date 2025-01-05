/**
 * Represents a Phi node in the SSA form.
 */
class Phi {
    blockId;
    place;
    operands;
    constructor(blockId, place, operands) {
        this.blockId = blockId;
        this.place = place;
        this.operands = operands;
    }
}

export { Phi };
//# sourceMappingURL=Phi.js.map
