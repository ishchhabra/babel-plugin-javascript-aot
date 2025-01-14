/**
 * Returns the name of the function declaration or arrow function expression.
 *
 * @param path - The path to the function declaration or arrow function expression.
 * @returns The name of the function declaration or arrow function expression.
 */
function getFunctionName(path) {
    if (path.isFunctionDeclaration()) {
        const id = path.get("id");
        if (id.isIdentifier()) {
            return id;
        }
        return null;
    }
    return null;
}

export { getFunctionName };
//# sourceMappingURL=babel-utils.js.map
