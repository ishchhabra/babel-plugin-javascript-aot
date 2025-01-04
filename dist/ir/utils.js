import { BasicBlock, makeBlockId } from "./Block";
import { Identifier, makeDeclarationId, makeIdentifierId, makeIdentifierName, } from "./Identifier";
import { makePlaceId, Place } from "./Place";
export function createPlace(identifier, environment) {
    const placeId = makePlaceId(environment.nextPlaceId++);
    return new Place(placeId, identifier);
}
export function createIdentifier(environment, declarationId) {
    const identfierId = makeIdentifierId(environment.nextIdentifierId++);
    const identifierName = makeIdentifierName(identfierId);
    declarationId ??= makeDeclarationId(environment.nextDeclarationId++);
    return new Identifier(identfierId, identifierName, declarationId);
}
export function createBlock(environment) {
    const blockId = makeBlockId(environment.nextBlockId++);
    return new BasicBlock(blockId, [], undefined);
}
//# sourceMappingURL=utils.js.map