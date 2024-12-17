"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeIdentifierId = makeIdentifierId;
exports.makeIdentifierName = makeIdentifierName;
function makeIdentifierId(id) {
    return id;
}
function makeIdentifierName(id) {
    return `$${id}`;
}
