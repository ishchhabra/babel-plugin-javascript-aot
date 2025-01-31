import { isKeyword } from '@babel/helper-validator-identifier';
import * as t from '@babel/types';

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
function toIdentifierOrStringLiteral(name) {
    return t.isValidIdentifier(name) || isKeyword(name)
        ? t.identifier(name)
        : t.stringLiteral(name);
}

export { getFunctionName, toIdentifierOrStringLiteral };
//# sourceMappingURL=babel-utils.js.map
