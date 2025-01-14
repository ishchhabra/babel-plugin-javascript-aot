import { BlockId } from "./ir";
import { DeclarationId } from "./ir/core/Identifier";
import { Place } from "./ir/core/Place";

export class Environment {
  declToPlaces: Map<DeclarationId, Array<{ blockId: BlockId; place: Place }>> =
    new Map();

  nextBlockId = 0;
  nextDeclarationId = 0;
  nextIdentifierId = 0;
  nextInstructionId = 0;
  nextPlaceId = 0;
  nextPhiId = 0;
}
