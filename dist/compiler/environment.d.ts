import { BlockId } from "../ir";
import { DeclarationId } from "../ir/Identifier";
import { Place } from "../ir/Place";
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
    private _dominators;
    private _immediateDominators;
    private _dominanceFrontier;
    get dominators(): Map<BlockId, Set<BlockId>>;
    set dominators(dominators: Map<BlockId, Set<BlockId>>);
    get immediateDominators(): Map<BlockId, BlockId | undefined>;
    set immediateDominators(immediateDominators: Map<BlockId, BlockId | undefined>);
    get dominanceFrontier(): Map<BlockId, Set<BlockId>>;
    set dominanceFrontier(dominanceFrontier: Map<BlockId, Set<BlockId>>);
}
