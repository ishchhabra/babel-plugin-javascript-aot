import { BlockId } from "./frontend/ir";
import { DeclarationId } from "./frontend/ir/Identifier";
import { Place } from "./frontend/ir/Place";
export declare class Environment {
    declToPlaces: Map<DeclarationId, Array<{
        blockId: BlockId;
        place: Place;
    }>>;
    nextBlockId: number;
    nextDeclarationId: number;
    nextIdentifierId: number;
    nextInstructionId: number;
    nextPlaceId: number;
}
