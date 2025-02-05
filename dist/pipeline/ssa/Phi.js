/**
 * Represents a Phi node in the SSA form.
 */
class Phi {
    blockId;
    place;
    operands;
    declarationId;
    constructor(blockId, place, operands, 
    /** The declaration ID of the variable that this Phi node represents. */
    declarationId) {
        this.blockId = blockId;
        this.place = place;
        this.operands = operands;
        this.declarationId = declarationId;
    }
}

export { Phi };
//# sourceMappingURL=Phi.js.map
