import { buildFunctionDeclarationBindings } from './buildFunctionDeclarationBindings.js';
import { buildVariableDeclarationBindings } from './buildVariableDeclarationBindings.js';

function buildBindings(bindingsPath, functionBuilder) {
    bindingsPath.traverse({
        FunctionDeclaration: (path) => {
            buildFunctionDeclarationBindings(bindingsPath, path, functionBuilder);
        },
        VariableDeclaration: (path) => {
            buildVariableDeclarationBindings(bindingsPath, path, functionBuilder);
        },
    });
}

export { buildBindings };
//# sourceMappingURL=buildBindings.js.map
