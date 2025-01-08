import { Environment } from "../../environment";
import { BasicBlock, makeBlockId } from "./Block";
import {
  DeclarationId,
  Identifier,
  makeDeclarationId,
  makeIdentifierId,
} from "./Identifier";
import { makePlaceId, Place } from "./Place";

export function createPlace(
  identifier: Identifier,
  environment: Environment,
): Place {
  const placeId = makePlaceId(environment.nextPlaceId++);
  return new Place(placeId, identifier);
}

export function createIdentifier(
  environment: Environment,
  declarationId?: DeclarationId,
): Identifier {
  declarationId ??= makeDeclarationId(environment.nextDeclarationId++);

  const identfierId = makeIdentifierId(environment.nextIdentifierId++);
  const version = environment.declToPlaces.get(declarationId)?.length ?? 0;
  return new Identifier(identfierId, `${version}`, declarationId);
}

export function createBlock(environment: Environment): BasicBlock {
  const blockId = makeBlockId(environment.nextBlockId++);
  return new BasicBlock(blockId, [], undefined);
}
