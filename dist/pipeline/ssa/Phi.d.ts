import { BlockId, IdentifierId, Place } from "../../ir";
export declare function makePhiIdentifierName(id: IdentifierId): string;
/**
 * Represents a Phi node in the SSA form.
 */
export declare class Phi {
    readonly blockId: BlockId;
    readonly place: Place;
    readonly operands: Map<BlockId, Place>;
    constructor(blockId: BlockId, place: Place, operands: Map<BlockId, Place>);
}
