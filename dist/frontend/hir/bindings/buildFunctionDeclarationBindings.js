import { getFunctionName } from '../../../babel-utils.js';

function buildFunctionDeclarationBindings(bindingsPath, nodePath, functionBuilder, environment) {
    // For function declarations, we only want direct children
    // of the binding path. The nested function declarations
    // are not in the scope of the current path.
    const parentPath = nodePath.parentPath;
    if (!parentPath.isExportDeclaration() && parentPath !== bindingsPath) {
        return;
    }
    const functionName = getFunctionName(nodePath);
    if (functionName === null) {
        return;
    }
    const identifier = environment.createIdentifier();
    functionBuilder.registerDeclarationName(functionName.node.name, identifier.declarationId, bindingsPath);
    // Rename the variable name in the scope to the temporary place.
    bindingsPath.scope.rename(functionName.node.name, identifier.name);
    functionBuilder.registerDeclarationName(identifier.name, identifier.declarationId, bindingsPath);
    const place = environment.createPlace(identifier);
    functionBuilder.registerDeclarationPlace(identifier.declarationId, place);
}

export { buildFunctionDeclarationBindings };
//# sourceMappingURL=buildFunctionDeclarationBindings.js.map
