/**
 * Simulated opaque type for IdentifierId to prevent using normal numbers as ids
 * accidentally.
 */
function makeIdentifierId(id) {
    return id;
}
function makeDeclarationId(id) {
    return id;
}
class Identifier {
    id;
    version;
    declarationId;
    constructor(id, version, declarationId) {
        this.id = id;
        this.version = version;
        this.declarationId = declarationId;
    }
    get name() {
        return `$${this.declarationId}_${this.version}`;
    }
}

export { Identifier, makeDeclarationId, makeIdentifierId };
//# sourceMappingURL=Identifier.js.map
