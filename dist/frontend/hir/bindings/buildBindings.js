import { buildFunctionDeclarationBindings } from './buildFunctionDeclarationBindings.js';
import { buildVariableDeclarationBindings } from './buildVariableDeclarationBindings.js';

function buildBindings(bindingsPath, functionBuilder, environment) {
    bindingsPath.traverse({
        FunctionDeclaration: (path) => {
            buildFunctionDeclarationBindings(bindingsPath, path, functionBuilder, environment);
        },
        VariableDeclaration: (path) => {
            buildVariableDeclarationBindings(bindingsPath, path, functionBuilder, environment);
        },
    });
}

export { buildBindings };
//# sourceMappingURL=buildBindings.js.map
