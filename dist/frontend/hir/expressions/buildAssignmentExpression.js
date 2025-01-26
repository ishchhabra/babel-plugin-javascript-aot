import { createIdentifier, createPlace, createInstructionId } from '../../../ir/utils.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { ArrayPatternInstruction } from '../../../ir/instructions/pattern/ArrayPattern.js';
import { BindingIdentifierInstruction } from '../../../ir/instructions/BindingIdentifier.js';
import { StorePropertyInstruction } from '../../../ir/instructions/memory/StoreProperty.js';
import { buildNode } from '../buildNode.js';

function buildAssignmentExpression(nodePath, functionBuilder, moduleBuilder) {
    const leftPath = nodePath.get("left");
    if (leftPath.isIdentifier()) {
        return buildIdentifierAssignment(nodePath, functionBuilder, moduleBuilder);
    }
    else if (leftPath.isMemberExpression()) {
        return buildMemberExpressionAssignment(nodePath, functionBuilder, moduleBuilder);
    }
    return buildDestructuringAssignment(nodePath, functionBuilder, moduleBuilder);
}
function buildIdentifierAssignment(nodePath, functionBuilder, moduleBuilder) {
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Assignment expression right must be a single place");
    }
    const leftPath = nodePath.get("left");
    leftPath.assertIdentifier();
    const declarationId = functionBuilder.getDeclarationId(leftPath.node.name, leftPath);
    if (declarationId === undefined) {
        throw new Error(`Variable accessed before declaration: ${leftPath.node.name}`);
    }
    const { place: leftPlace } = buildIdentifierAssignmentLeft(leftPath, nodePath, functionBuilder);
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(new StoreLocalInstruction(instructionId, place, nodePath, leftPlace, rightPlace, "const"));
    return place;
}
function buildMemberExpressionAssignment(nodePath, functionBuilder, moduleBuilder) {
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Assignment expression right must be a single place");
    }
    const leftPath = nodePath.get("left");
    leftPath.assertMemberExpression();
    const objectPath = leftPath.get("object");
    const objectPlace = buildNode(objectPath, functionBuilder, moduleBuilder);
    if (objectPlace === undefined || Array.isArray(objectPlace)) {
        throw new Error("Assignment expression left must be a single place");
    }
    const propertyPath = leftPath.get("property");
    propertyPath.assertIdentifier();
    const property = propertyPath.node.name;
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(new StorePropertyInstruction(instructionId, place, nodePath, objectPlace, property, rightPlace));
    return place;
}
function buildDestructuringAssignment(nodePath, functionBuilder, moduleBuilder) {
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Assignment expression right must be a single place");
    }
    const leftPath = nodePath.get("left");
    const { place: leftPlace, instructions } = buildAssignmentLeft(leftPath, nodePath, functionBuilder);
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instructionId = createInstructionId(functionBuilder.environment);
    functionBuilder.addInstruction(new StoreLocalInstruction(instructionId, place, nodePath, leftPlace, rightPlace, "const"));
    for (const instruction of instructions) {
        functionBuilder.addInstruction(instruction);
    }
    return place;
}
function buildAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder) {
    if (leftPath.isIdentifier()) {
        return buildIdentifierAssignmentLeft(leftPath, nodePath, functionBuilder);
    }
    else if (leftPath.isArrayPattern()) {
        return buildArrayPatternAssignmentLeft(leftPath, nodePath, functionBuilder);
    }
    throw new Error("Unsupported assignment left");
}
function buildIdentifierAssignmentLeft(leftPath, nodePath, functionBuilder) {
    const declarationId = functionBuilder.getDeclarationId(leftPath.node.name, nodePath);
    if (declarationId === undefined) {
        throw new Error(`Variable accessed before declaration: ${leftPath.node.name}`);
    }
    const identifier = createIdentifier(functionBuilder.environment, declarationId);
    const place = createPlace(identifier, functionBuilder.environment);
    functionBuilder.addInstruction(new BindingIdentifierInstruction(createInstructionId(functionBuilder.environment), place, nodePath, identifier.name));
    functionBuilder.registerDeclarationPlace(declarationId, place);
    return { place, instructions: [] };
}
function buildArrayPatternAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder) {
    const instructions = [];
    const elementPaths = leftPath.get("elements");
    const elementPlaces = elementPaths.map((elementPath) => {
        if (elementPath.isOptionalMemberExpression()) {
            throw new Error("Unsupported optional member expression");
        }
        const { place, instructions: elementInstructions } = buildAssignmentLeft(elementPath, nodePath, functionBuilder);
        instructions.push(...elementInstructions);
        return place;
    });
    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    functionBuilder.addInstruction(new ArrayPatternInstruction(createInstructionId(functionBuilder.environment), place, nodePath, elementPlaces));
    return { place, instructions };
}

export { buildAssignmentExpression };
//# sourceMappingURL=buildAssignmentExpression.js.map
