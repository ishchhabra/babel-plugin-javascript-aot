import { BlockId, DeclarationId, IdentifierId, Place } from "../../ir";
export declare function makePhiIdentifierName(id: IdentifierId): string;
/**
 * Represents a Phi node in the SSA form.
 */
export declare class Phi {
    readonly blockId: BlockId;
    readonly place: Place;
    readonly operands: Map<BlockId, Place>;
    /** The declaration ID of the variable that this Phi node represents. */
    readonly declarationId: DeclarationId;
    constructor(blockId: BlockId, place: Place, operands: Map<BlockId, Place>, 
    /** The declaration ID of the variable that this Phi node represents. */
    declarationId: DeclarationId);
}
