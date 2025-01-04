/**
 * Simulated opaque type for IdentifierId to prevent using normal numbers as ids
 * accidentally.
 */
function makeIdentifierId(id) {
    return id;
}
function makeIdentifierName(id) {
    return `$${id}`;
}
function makeDeclarationId(id) {
    return id;
}
class Identifier {
    id;
    name;
    declarationId;
    constructor(id, name, declarationId) {
        this.id = id;
        this.name = name;
        this.declarationId = declarationId;
    }
}

export { Identifier, makeDeclarationId, makeIdentifierId, makeIdentifierName };
//# sourceMappingURL=Identifier.js.map
