import { createIdentifier, createPlace } from '../../../ir/utils.js';

function buildVariableDeclarationBindings(bindingsPath, nodePath, builder) {
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
        buildLValBindings(bindingsPath, id, builder);
    }
}
function buildLValBindings(bindingsPath, nodePath, builder) {
    switch (nodePath.type) {
        case "Identifier":
            nodePath.assertIdentifier();
            buildIdentifierBindings(bindingsPath, nodePath, builder);
            break;
        case "ArrayPattern":
            nodePath.assertArrayPattern();
            buildArrayPatternBindings(bindingsPath, nodePath, builder);
            break;
        case "ObjectPattern":
            nodePath.assertObjectPattern();
            buildObjectPatternBindings(bindingsPath, nodePath, builder);
            break;
        case "RestElement":
            nodePath.assertRestElement();
            buildRestElementBindings(bindingsPath, nodePath, builder);
            break;
        default:
            throw new Error(`Unsupported LVal type: ${nodePath.type}`);
    }
}
function buildIdentifierBindings(bindingsPath, nodePath, builder) {
    const identifier = createIdentifier(builder.environment);
    builder.registerDeclarationName(nodePath.node.name, identifier.declarationId, bindingsPath);
    // Rename the variable name in the scope to the temporary place.
    bindingsPath.scope.rename(nodePath.node.name, identifier.name);
    builder.registerDeclarationName(identifier.name, identifier.declarationId, bindingsPath);
    const place = createPlace(identifier, builder.environment);
    builder.registerDeclarationPlace(identifier.declarationId, place);
}
function buildArrayPatternBindings(bindingsPath, nodePath, builder) {
    const elementsPath = nodePath.get("elements");
    for (const elementPath of elementsPath) {
        elementPath.assertLVal();
        buildLValBindings(bindingsPath, elementPath, builder);
    }
}
function buildObjectPatternBindings(bindingsPath, nodePath, builder) {
    const propertiesPath = nodePath.get("properties");
    for (const propertyPath of propertiesPath) {
        if (!propertyPath.isLVal()) {
            throw new Error(`Unsupported property type: ${propertyPath.type}`);
        }
        buildLValBindings(bindingsPath, propertyPath, builder);
    }
}
function buildRestElementBindings(bindingsPath, nodePath, builder) {
    const elementPath = nodePath.get("argument");
    buildLValBindings(bindingsPath, elementPath, builder);
}
function buildParameterBindings(bindingsPath, nodePath, builder) {
    switch (nodePath.type) {
        case "Identifier":
            nodePath.assertIdentifier();
            buildIdentifierBindings(bindingsPath, nodePath, builder);
            break;
        case "RestElement":
            nodePath.assertRestElement();
            buildRestElementBindings(bindingsPath, nodePath, builder);
            break;
        default:
            throw new Error(`Unsupported parameter type: ${nodePath.type}`);
    }
}

export { buildParameterBindings, buildVariableDeclarationBindings };
//# sourceMappingURL=buildVariableDeclarationBindings.js.map
