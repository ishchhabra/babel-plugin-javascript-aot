import { createIdentifier, createPlace } from '../../../ir/utils.js';

function buildVariableDeclarationBindings(bindingsPath, nodePath, functionBuilder) {
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
        buildLValBindings(bindingsPath, id, functionBuilder);
    }
}
function buildLValBindings(bindingsPath, nodePath, functionBuilder) {
    switch (nodePath.type) {
        case "Identifier":
            nodePath.assertIdentifier();
            buildIdentifierBindings(bindingsPath, nodePath, functionBuilder);
            break;
        case "ArrayPattern":
            nodePath.assertArrayPattern();
            buildArrayPatternBindings(bindingsPath, nodePath, functionBuilder);
            break;
        case "ObjectPattern":
            nodePath.assertObjectPattern();
            buildObjectPatternBindings(bindingsPath, nodePath, functionBuilder);
            break;
        case "RestElement":
            nodePath.assertRestElement();
            buildRestElementBindings(bindingsPath, nodePath, functionBuilder);
            break;
        default:
            throw new Error(`Unsupported LVal type: ${nodePath.type}`);
    }
}
function buildIdentifierBindings(bindingsPath, nodePath, functionBuilder) {
    const identifier = createIdentifier(functionBuilder.environment);
    functionBuilder.registerDeclarationName(nodePath.node.name, identifier.declarationId, bindingsPath);
    // Rename the variable name in the scope to the temporary place.
    bindingsPath.scope.rename(nodePath.node.name, identifier.name);
    functionBuilder.registerDeclarationName(identifier.name, identifier.declarationId, bindingsPath);
    const place = createPlace(identifier, functionBuilder.environment);
    functionBuilder.registerDeclarationPlace(identifier.declarationId, place);
}
function buildArrayPatternBindings(bindingsPath, nodePath, functionBuilder) {
    const elementsPath = nodePath.get("elements");
    for (const elementPath of elementsPath) {
        elementPath.assertLVal();
        buildLValBindings(bindingsPath, elementPath, functionBuilder);
    }
}
function buildObjectPatternBindings(bindingsPath, nodePath, functionBuilder) {
    const propertiesPath = nodePath.get("properties");
    for (const propertyPath of propertiesPath) {
        if (!propertyPath.isLVal()) {
            throw new Error(`Unsupported property type: ${propertyPath.type}`);
        }
        buildLValBindings(bindingsPath, propertyPath, functionBuilder);
    }
}
function buildRestElementBindings(bindingsPath, nodePath, functionBuilder) {
    const elementPath = nodePath.get("argument");
    buildLValBindings(bindingsPath, elementPath, functionBuilder);
}
function buildParameterBindings(bindingsPath, nodePath, functionBuilder) {
    switch (nodePath.type) {
        case "Identifier":
            nodePath.assertIdentifier();
            buildIdentifierBindings(bindingsPath, nodePath, functionBuilder);
            break;
        case "RestElement":
            nodePath.assertRestElement();
            buildRestElementBindings(bindingsPath, nodePath, functionBuilder);
            break;
        default:
            throw new Error(`Unsupported parameter type: ${nodePath.type}`);
    }
}

export { buildParameterBindings, buildVariableDeclarationBindings };
//# sourceMappingURL=buildVariableDeclarationBindings.js.map
