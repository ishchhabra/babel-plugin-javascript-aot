import { Environment } from "../compiler";
import {
  DeclarationId,
  Identifier,
  makeDeclarationId,
  makeIdentifierId,
} from "../ir";
import { makePhiIdentifierName } from "./Phi";

export function createPhiIdentifier(
  environment: Environment,
  declarationId?: DeclarationId
): Identifier {
  const identifierId = makeIdentifierId(environment.nextIdentifierId++);
  const identifierName = makePhiIdentifierName(identifierId);
  declarationId ??= makeDeclarationId(environment.nextDeclarationId++);
  return new Identifier(identifierId, identifierName, declarationId);
}
