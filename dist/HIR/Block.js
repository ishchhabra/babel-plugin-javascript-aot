export function makeBlockId(id) {
    return id;
}
export function makeEmptyBlock(id) {
    return {
        kind: "block",
        id,
        instructions: [],
        terminal: { kind: "unsupported" },
    };
}
