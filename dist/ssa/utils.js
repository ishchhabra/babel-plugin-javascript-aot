import { makeIdentifierId, makeDeclarationId, Identifier } from '../ir/Identifier.js';
import { makePhiIdentifierName } from './Phi.js';

function createPhiIdentifier(environment, declarationId) {
    const identifierId = makeIdentifierId(environment.nextIdentifierId++);
    const identifierName = makePhiIdentifierName(identifierId);
    declarationId ??= makeDeclarationId(environment.nextDeclarationId++);
    return new Identifier(identifierId, identifierName, declarationId);
}

export { createPhiIdentifier };
//# sourceMappingURL=utils.js.map
