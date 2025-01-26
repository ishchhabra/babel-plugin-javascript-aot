import { buildFunctionDeclarationBindings } from './buildFunctionDeclarationBindings.js';
import { buildVariableDeclarationBindings, buildParameterBindings } from './buildVariableDeclarationBindings.js';

function buildBindings(bindingsPath, functionBuilder) {
    bindingsPath.traverse({
        FunctionDeclaration: (path) => {
            buildFunctionDeclarationBindings(bindingsPath, path, functionBuilder);
        },
        VariableDeclaration: (path) => {
            buildVariableDeclarationBindings(bindingsPath, path, functionBuilder);
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
            buildParameterBindings(bindingsPath, paramPath, functionBuilder);
        }
    }
}

export { buildBindings };
//# sourceMappingURL=buildBindings.js.map
