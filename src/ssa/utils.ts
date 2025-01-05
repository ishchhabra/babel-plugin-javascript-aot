import { Environment } from "../compiler";
import {
  DeclarationId,
  Identifier,
  makeDeclarationId,
  makeIdentifierId,
} from "../ir";

export function createPhiIdentifier(
  environment: Environment,
  declarationId?: DeclarationId
): Identifier {
  declarationId ??= makeDeclarationId(environment.nextDeclarationId++);

  const identifierId = makeIdentifierId(environment.nextIdentifierId++);
  const version = environment.declToPlaces.get(declarationId)?.length ?? 0;
  return new Identifier(identifierId, `phi_${version}`, declarationId);
}
