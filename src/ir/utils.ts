import { Environment } from "../compiler";
import { BasicBlock, makeBlockId } from "./Block";
import {
  DeclarationId,
  Identifier,
  makeDeclarationId,
  makeIdentifierId,
  makeIdentifierName,
} from "./Identifier";
import { makePlaceId, Place } from "./Place";

export function createPlace(
  identifier: Identifier,
  environment: Environment
): Place {
  const placeId = makePlaceId(environment.nextPlaceId++);
  return new Place(placeId, identifier);
}

export function createIdentifier(
  environment: Environment,
  declarationId?: DeclarationId
): Identifier {
  const identfierId = makeIdentifierId(environment.nextIdentifierId++);
  const identifierName = makeIdentifierName(identfierId);
  declarationId ??= makeDeclarationId(environment.nextDeclarationId++);
  return new Identifier(identfierId, identifierName, declarationId);
}

export function createBlock(environment: Environment): BasicBlock {
  const blockId = makeBlockId(environment.nextBlockId++);
  return new BasicBlock(blockId, [], undefined);
}
