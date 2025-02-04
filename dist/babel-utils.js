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
/**
 * Determines whether a MemberExpression should be considered "static"
 * or "dynamic" in the intermediate representation (IR).
 *
 * A MemberExpression is treated as "static" if it is not computed
 * (i.e., accessed via dot notation) or if it is accessed via bracket
 * notation with a known literal property (e.g., `obj["foo"]` or
 * `obj[0]`). In contrast, any bracket access (e.g., `obj[anything]`)
 * sets `node.computed = true` in Babel, indicating dynamic access.
 *
 * @param path - The NodePath of the MemberExpression to evaluate.
 * @returns `true` if the MemberExpression is static, `false` if it is dynamic.
 */
function isStaticMemberAccess(path) {
    if (!path.node.computed) {
        return true;
    }
    const prop = path.node.property;
    if (t.isStringLiteral(prop) || t.isNumericLiteral(prop)) {
        return true;
    }
    return false;
}

export { getFunctionName, isStaticMemberAccess, toIdentifierOrStringLiteral };
//# sourceMappingURL=babel-utils.js.map
