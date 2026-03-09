import { Environment } from "../../environment";
import {
  DeclarationId,
  Identifier,
  makeDeclarationId,
  makeIdentifierId,
} from "../../ir";

export function createPhiIdentifier(
  environment: Environment,
  declarationId?: DeclarationId,
): Identifier {
  declarationId ??= makeDeclarationId(environment.nextDeclarationId++);

  const identifierId = makeIdentifierId(environment.nextIdentifierId++);
  return new Identifier(identifierId, `phi_${identifierId}`, declarationId);
}
