"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBlockId = makeBlockId;
exports.makeEmptyBlock = makeEmptyBlock;
function makeBlockId(id) {
    return id;
}
function makeEmptyBlock(id) {
    return {
        kind: "block",
        id,
        instructions: [],
        terminal: { kind: "unsupported" },
    };
}
