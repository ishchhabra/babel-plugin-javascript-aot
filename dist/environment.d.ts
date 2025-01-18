import { BlockId } from "./ir";
import { DeclarationId } from "./ir/core/Identifier";
import { Place } from "./ir/core/Place";
export declare class Environment {
    declToPlaces: Map<DeclarationId, Array<{
        blockId: BlockId;
        place: Place;
    }>>;
    nextFunctionId: number;
    nextBlockId: number;
    nextDeclarationId: number;
    nextIdentifierId: number;
    nextInstructionId: number;
    nextPlaceId: number;
    nextPhiId: number;
}
