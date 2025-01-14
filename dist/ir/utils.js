import { makeBlockId, BasicBlock } from './core/Block.js';
import { makeDeclarationId, makeIdentifierId, Identifier } from './core/Identifier.js';
import { makePlaceId, Place } from './core/Place.js';

function createPlace(identifier, environment) {
    const placeId = makePlaceId(environment.nextPlaceId++);
    return new Place(placeId, identifier);
}
function createIdentifier(environment, declarationId) {
    declarationId ??= makeDeclarationId(environment.nextDeclarationId++);
    const identfierId = makeIdentifierId(environment.nextIdentifierId++);
    const version = environment.declToPlaces.get(declarationId)?.length ?? 0;
    return new Identifier(identfierId, `${version}`, declarationId);
}
function createBlock(environment) {
    const blockId = makeBlockId(environment.nextBlockId++);
    return new BasicBlock(blockId, [], undefined);
}

export { createBlock, createIdentifier, createPlace };
//# sourceMappingURL=utils.js.map
