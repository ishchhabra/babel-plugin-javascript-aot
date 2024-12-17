"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeDeclarationId = makeDeclarationId;
/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueDeclarationId = Symbol();
function makeDeclarationId(id) {
    return id;
}
