import { Identifier, makeDeclarationId, makeIdentifierId, } from "../ir";
import { makePhiIdentifierName } from "./Phi";
export function createPhiIdentifier(environment, declarationId) {
    const identifierId = makeIdentifierId(environment.nextIdentifierId++);
    const identifierName = makePhiIdentifierName(identifierId);
    declarationId ??= makeDeclarationId(environment.nextDeclarationId++);
    return new Identifier(identifierId, identifierName, declarationId);
}
//# sourceMappingURL=utils.js.map