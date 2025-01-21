import { BaseInstruction, BlockId } from "./ir";
import { DeclarationId } from "./ir/core/Identifier";
import { Place, PlaceId } from "./ir/core/Place";
export declare class Environment {
    declToPlaces: Map<DeclarationId, Array<{
        blockId: BlockId;
        place: Place;
    }>>;
    placeToInstruction: Map<PlaceId, BaseInstruction>;
    nextFunctionId: number;
    nextBlockId: number;
    nextDeclarationId: number;
    nextIdentifierId: number;
    nextInstructionId: number;
    nextPlaceId: number;
    nextPhiId: number;
}
