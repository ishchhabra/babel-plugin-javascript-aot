import { BlockId } from "./frontend/ir";
import { DeclarationId } from "./frontend/ir/Identifier";
import { Place } from "./frontend/ir/Place";

export class Environment {
  declToPlaces: Map<DeclarationId, Array<{ blockId: BlockId; place: Place }>> =
    new Map();

  nextBlockId = 0;
  nextDeclarationId = 0;
  nextIdentifierId = 0;
  nextInstructionId = 0;
  nextPlaceId = 0;
}
