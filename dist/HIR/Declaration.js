/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueDeclarationId = Symbol();
export function makeDeclarationId(id) {
    return id;
}
