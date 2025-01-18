function generateUnsupportedNode(instruction, generator) {
    const node = instruction.node;
    generator.places.set(instruction.place.id, node);
    return node;
}

export { generateUnsupportedNode };
//# sourceMappingURL=generateUnsupportedNode.js.map
