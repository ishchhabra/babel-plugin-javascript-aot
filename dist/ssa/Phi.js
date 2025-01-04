export function makePhiIdentifierName(id) {
    return `phi_${id}`;
}
/**
 * Represents a Phi node in the SSA form.
 */
export class Phi {
    blockId;
    place;
    operands;
    constructor(blockId, place, operands) {
        this.blockId = blockId;
        this.place = place;
        this.operands = operands;
    }
}
//# sourceMappingURL=Phi.js.map