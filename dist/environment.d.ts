import { BaseInstruction, BlockId } from "./ir";
import { DeclarationId } from "./ir/core/Identifier";
import { Place, PlaceId } from "./ir/core/Place";
type ModuleGlobal = {
    kind: "import";
    source: string;
    name: string;
} | {
    kind: "builtin";
};
export declare class Environment {
    declToPlaces: Map<DeclarationId, Array<{
        blockId: BlockId;
        place: Place;
    }>>;
    placeToInstruction: Map<PlaceId, BaseInstruction>;
    globals: Map<string, ModuleGlobal>;
    nextFunctionId: number;
    nextBlockId: number;
    nextDeclarationId: number;
    nextIdentifierId: number;
    nextInstructionId: number;
    nextPlaceId: number;
    nextPhiId: number;
}
export {};
