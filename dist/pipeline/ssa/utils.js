import { makeDeclarationId, makeIdentifierId, Identifier } from '../../ir/core/Identifier.js';

function createPhiIdentifier(environment, declarationId) {
    declarationId ??= makeDeclarationId(environment.nextDeclarationId++);
    const identifierId = makeIdentifierId(environment.nextIdentifierId++);
    return new Identifier(identifierId, `phi_${identifierId}`, declarationId);
}

export { createPhiIdentifier };
//# sourceMappingURL=utils.js.map
