import { makeBlockId, BasicBlock } from './Block.js';
import { makeIdentifierId, makeDeclarationId, Identifier, makeIdentifierName } from './Identifier.js';
import { makePlaceId, Place } from './Place.js';

function createPlace(identifier, environment) {
    const placeId = makePlaceId(environment.nextPlaceId++);
    return new Place(placeId, identifier);
}
function createIdentifier(environment, declarationId) {
    const identfierId = makeIdentifierId(environment.nextIdentifierId++);
    const identifierName = makeIdentifierName(identfierId);
    declarationId ??= makeDeclarationId(environment.nextDeclarationId++);
    return new Identifier(identfierId, identifierName, declarationId);
}
function createBlock(environment) {
    const blockId = makeBlockId(environment.nextBlockId++);
    return new BasicBlock(blockId, [], undefined);
}

export { createBlock, createIdentifier, createPlace };
//# sourceMappingURL=utils.js.map
