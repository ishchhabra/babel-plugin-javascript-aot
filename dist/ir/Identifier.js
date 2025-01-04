/**
 * Simulated opaque type for IdentifierId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueIdentifierId = Symbol();
export function makeIdentifierId(id) {
    return id;
}
export function makeIdentifierName(id) {
    return `$${id}`;
}
/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueDeclarationId = Symbol();
export function makeDeclarationId(id) {
    return id;
}
export class Identifier {
    id;
    name;
    declarationId;
    constructor(id, name, declarationId) {
        this.id = id;
        this.name = name;
        this.declarationId = declarationId;
    }
}
//# sourceMappingURL=Identifier.js.map