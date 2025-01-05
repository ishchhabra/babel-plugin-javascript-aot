function makePhiIdentifierName(id) {
    return `phi_${id}`;
}
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

export { Phi, makePhiIdentifierName };
//# sourceMappingURL=Phi.js.map
