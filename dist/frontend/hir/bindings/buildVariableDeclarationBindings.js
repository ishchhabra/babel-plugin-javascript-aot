function buildVariableDeclarationBindings(bindingsPath, nodePath, functionBuilder, environment) {
    const isHoistable = bindingsPath.isFunctionDeclaration() && nodePath.node.kind === "var";
    const parentPath = nodePath.parentPath;
    if (!parentPath.isExportDeclaration() &&
        parentPath !== bindingsPath &&
        !isHoistable) {
        return;
    }
    const declarationPaths = nodePath.get("declarations");
    for (const declarationPath of declarationPaths) {
        const id = declarationPath.get("id");
        buildLValBindings(bindingsPath, id, functionBuilder, environment);
    }
}
function buildLValBindings(bindingsPath, nodePath, functionBuilder, environment) {
    switch (nodePath.type) {
        case "Identifier":
            nodePath.assertIdentifier();
            buildIdentifierBindings(bindingsPath, nodePath, functionBuilder, environment);
            break;
        case "ArrayPattern":
            nodePath.assertArrayPattern();
            buildArrayPatternBindings(bindingsPath, nodePath, functionBuilder, environment);
            break;
        case "ObjectPattern":
            nodePath.assertObjectPattern();
            buildObjectPatternBindings(bindingsPath, nodePath, functionBuilder, environment);
            break;
        case "RestElement":
            nodePath.assertRestElement();
            buildRestElementBindings(bindingsPath, nodePath, functionBuilder, environment);
            break;
        default:
            throw new Error(`Unsupported LVal type: ${nodePath.type}`);
    }
}
function buildIdentifierBindings(bindingsPath, nodePath, functionBuilder, environment) {
    const identifier = environment.createIdentifier();
    functionBuilder.registerDeclarationName(nodePath.node.name, identifier.declarationId, bindingsPath);
    // Rename the variable name in the scope to the temporary place.
    bindingsPath.scope.rename(nodePath.node.name, identifier.name);
    functionBuilder.registerDeclarationName(identifier.name, identifier.declarationId, bindingsPath);
    const place = environment.createPlace(identifier);
    environment.registerDeclaration(identifier.declarationId, functionBuilder.currentBlock.id, place.id);
}
function buildArrayPatternBindings(bindingsPath, nodePath, functionBuilder, environment) {
    const elementsPath = nodePath.get("elements");
    for (const elementPath of elementsPath) {
        elementPath.assertLVal();
        buildLValBindings(bindingsPath, elementPath, functionBuilder, environment);
    }
}
function buildObjectPatternBindings(bindingsPath, nodePath, functionBuilder, environment) {
    const propertiesPath = nodePath.get("properties");
    for (const propertyPath of propertiesPath) {
        if (!propertyPath.isLVal()) {
            throw new Error(`Unsupported property type: ${propertyPath.type}`);
        }
        buildLValBindings(bindingsPath, propertyPath, functionBuilder, environment);
    }
}
function buildRestElementBindings(bindingsPath, nodePath, functionBuilder, environment) {
    const elementPath = nodePath.get("argument");
    buildLValBindings(bindingsPath, elementPath, functionBuilder, environment);
}

export { buildVariableDeclarationBindings };
//# sourceMappingURL=buildVariableDeclarationBindings.js.map
