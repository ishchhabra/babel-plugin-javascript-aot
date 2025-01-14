import { buildFunctionDeclarationBindings } from './buildFunctionDeclarationBindings.js';
import { buildVariableDeclarationBindings, buildParameterBindings } from './buildVariableDeclarationBindings.js';

function buildBindings(bindingsPath, builder) {
    bindingsPath.traverse({
        FunctionDeclaration: (path) => {
            buildFunctionDeclarationBindings(bindingsPath, path, builder);
        },
        VariableDeclaration: (path) => {
            buildVariableDeclarationBindings(bindingsPath, path, builder);
        },
    });
    // Register the parameter bindings for function declarations.
    if (bindingsPath.isFunctionDeclaration() || bindingsPath.isObjectMethod()) {
        const paramPaths = bindingsPath.get("params");
        if (!Array.isArray(paramPaths)) {
            throw new Error(`Expected params to be an array`);
        }
        for (const paramPath of paramPaths) {
            if (!paramPath.isIdentifier() &&
                !paramPath.isRestElement() &&
                !paramPath.isPattern()) {
                throw new Error(`Unsupported parameter type: ${paramPath.type}`);
            }
            buildParameterBindings(bindingsPath, paramPath, builder);
        }
    }
}

export { buildBindings };
//# sourceMappingURL=buildBindings.js.map
