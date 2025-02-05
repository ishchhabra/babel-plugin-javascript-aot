import { isStaticMemberAccess } from '../../../babel-utils.js';
import { ExpressionStatementInstruction } from '../../../ir/instructions/ExpressionStatement.js';
import { LoadLocalInstruction } from '../../../ir/instructions/memory/LoadLocal.js';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { ArrayPatternInstruction } from '../../../ir/instructions/pattern/ArrayPattern.js';
import { BinaryExpressionInstruction } from '../../../ir/instructions/value/BinaryExpression.js';
import { HoleInstruction } from '../../../ir/instructions/value/Hole.js';
import { ObjectPropertyInstruction } from '../../../ir/instructions/value/ObjectProperty.js';
import { BindingIdentifierInstruction } from '../../../ir/instructions/BindingIdentifier.js';
import { RestElementInstruction } from '../../../ir/instructions/RestElement.js';
import 'lodash-es';
import { StoreDynamicPropertyInstruction } from '../../../ir/instructions/memory/StoreDynamicProperty.js';
import { StoreStaticPropertyInstruction } from '../../../ir/instructions/memory/StoreStaticProperty.js';
import { AssignmentPatternInstruction } from '../../../ir/instructions/pattern/AssignmentPattern.js';
import { ObjectPatternInstruction } from '../../../ir/instructions/pattern/ObjectPattern.js';
import { buildNode } from '../buildNode.js';

function buildAssignmentExpression(nodePath, functionBuilder, moduleBuilder, environment) {
    const leftPath = nodePath.get("left");
    if (leftPath.isIdentifier()) {
        return buildIdentifierAssignment(nodePath, functionBuilder, moduleBuilder, environment);
    }
    else if (leftPath.isMemberExpression()) {
        return buildMemberExpressionAssignment(nodePath, functionBuilder, moduleBuilder, environment);
    }
    return buildDestructuringAssignment(nodePath, functionBuilder, moduleBuilder, environment);
}
function buildIdentifierAssignment(nodePath, functionBuilder, moduleBuilder, environment) {
    const rightPlace = buildAssignmentRight(nodePath, functionBuilder, moduleBuilder, environment);
    const leftPath = nodePath.get("left");
    leftPath.assertIdentifier();
    const declarationId = functionBuilder.getDeclarationId(leftPath.node.name, leftPath);
    if (declarationId === undefined) {
        throw new Error(`Variable accessed before declaration: ${leftPath.node.name}`);
    }
    const { place: leftPlace } = buildIdentifierAssignmentLeft(leftPath, nodePath, functionBuilder, environment);
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(StoreLocalInstruction, place, nodePath, leftPlace, rightPlace, "const");
    functionBuilder.addInstruction(instruction);
    return place;
}
function buildMemberExpressionAssignment(nodePath, functionBuilder, moduleBuilder, environment) {
    const rightPlace = buildAssignmentRight(nodePath, functionBuilder, moduleBuilder, environment);
    const leftPath = nodePath.get("left");
    leftPath.assertMemberExpression();
    const objectPath = leftPath.get("object");
    const objectPlace = buildNode(objectPath, functionBuilder, moduleBuilder, environment);
    if (objectPlace === undefined || Array.isArray(objectPlace)) {
        throw new Error("Assignment expression left must be a single place");
    }
    if (isStaticMemberAccess(leftPath)) {
        const propertyPath = leftPath.get("property");
        propertyPath.assertIdentifier();
        const property = propertyPath.node.name;
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instruction = environment.createInstruction(StoreStaticPropertyInstruction, place, nodePath, objectPlace, property, rightPlace);
        functionBuilder.addInstruction(instruction);
        return place;
    }
    else {
        const propertyPath = leftPath.get("property");
        const propertyPlace = buildNode(propertyPath, functionBuilder, moduleBuilder, environment);
        if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
            throw new Error("Assignment expression left must be a single place");
        }
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instruction = environment.createInstruction(StoreDynamicPropertyInstruction, place, nodePath, objectPlace, propertyPlace, rightPlace);
        functionBuilder.addInstruction(instruction);
        return place;
    }
}
function buildDestructuringAssignment(nodePath, functionBuilder, moduleBuilder, environment) {
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder, environment);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Assignment expression right must be a single place");
    }
    const leftPath = nodePath.get("left");
    leftPath.assertLVal();
    const { place: leftPlace, instructions } = buildAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment);
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(StoreLocalInstruction, place, nodePath, leftPlace, rightPlace, "const");
    functionBuilder.addInstruction(instruction);
    for (const instruction of instructions) {
        functionBuilder.addInstruction(instruction);
    }
    return place;
}
function buildAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment) {
    if (leftPath.isIdentifier()) {
        return buildIdentifierAssignmentLeft(leftPath, nodePath, functionBuilder, environment);
    }
    else if (leftPath.isMemberExpression()) {
        return buildMemberExpressionAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment);
    }
    else if (leftPath.isArrayPattern()) {
        return buildArrayPatternAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment);
    }
    else if (leftPath.isObjectPattern()) {
        return buildObjectPatternAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment);
    }
    else if (leftPath.isAssignmentPattern()) {
        return buildAssignmentPatternAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment);
    }
    else if (leftPath.isRestElement()) {
        return buildRestElementAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment);
    }
    throw new Error("Unsupported assignment left");
}
function buildIdentifierAssignmentLeft(leftPath, nodePath, functionBuilder, environment) {
    const declarationId = functionBuilder.getDeclarationId(leftPath.node.name, nodePath);
    if (declarationId === undefined) {
        throw new Error(`Variable accessed before declaration: ${leftPath.node.name}`);
    }
    const identifier = environment.createIdentifier(declarationId);
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(BindingIdentifierInstruction, place, nodePath, identifier.name);
    functionBuilder.addInstruction(instruction);
    environment.registerDeclaration(declarationId, functionBuilder.currentBlock.id, place.id);
    return { place, instructions: [] };
}
function buildMemberExpressionAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment) {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(BindingIdentifierInstruction, place, nodePath, identifier.name);
    functionBuilder.addInstruction(instruction);
    environment.registerDeclaration(identifier.declarationId, functionBuilder.currentBlock.id, place.id);
    const loadLocalPlace = environment.createPlace(environment.createIdentifier());
    const loadLocalInstruction = environment.createInstruction(LoadLocalInstruction, loadLocalPlace, nodePath, place);
    const objectPath = leftPath.get("object");
    const objectPlace = buildNode(objectPath, functionBuilder, moduleBuilder, environment);
    if (objectPlace === undefined || Array.isArray(objectPlace)) {
        throw new Error("Assignment expression left must be a single place");
    }
    const propertyPath = leftPath.get("property");
    propertyPath.assertIdentifier();
    const property = propertyPath.node.name;
    const storePropertyPlace = environment.createPlace(environment.createIdentifier());
    const storePropertyInstruction = environment.createInstruction(StoreStaticPropertyInstruction, storePropertyPlace, nodePath, objectPlace, property, loadLocalPlace);
    const expressionStatementPlace = environment.createPlace(environment.createIdentifier());
    const expressionStatementInstruction = environment.createInstruction(ExpressionStatementInstruction, expressionStatementPlace, nodePath, storePropertyPlace);
    return {
        place,
        instructions: [
            loadLocalInstruction,
            storePropertyInstruction,
            expressionStatementInstruction,
        ],
    };
}
function buildArrayPatternAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment) {
    const instructions = [];
    const elementPaths = leftPath.get("elements");
    const elementPlaces = elementPaths.map((elementPath) => {
        if (elementPath.isOptionalMemberExpression()) {
            throw new Error("Unsupported optional member expression");
        }
        if (!elementPath.hasNode()) {
            const holeIdentifier = environment.createIdentifier();
            const holePlace = environment.createPlace(holeIdentifier);
            const instruction = environment.createInstruction(HoleInstruction, holePlace, elementPath);
            functionBuilder.addInstruction(instruction);
            return holePlace;
        }
        const { place, instructions: elementInstructions } = buildAssignmentLeft(elementPath, nodePath, functionBuilder, moduleBuilder, environment);
        instructions.push(...elementInstructions);
        return place;
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ArrayPatternInstruction, place, leftPath, elementPlaces);
    functionBuilder.addInstruction(instruction);
    return { place, instructions };
}
function buildObjectPatternAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment) {
    const instructions = [];
    const propertyPaths = leftPath.get("properties");
    const propertyPlaces = propertyPaths.map((propertyPath) => {
        if (propertyPath.isObjectProperty()) {
            const keyPath = propertyPath.get("key");
            const keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder, environment);
            if (keyPlace === undefined || Array.isArray(keyPlace)) {
                throw new Error("Object pattern key must be a single place");
            }
            const valuePath = propertyPath.get("value");
            const { place: valuePlace, instructions: valueInstructions } = buildAssignmentLeft(valuePath, nodePath, functionBuilder, moduleBuilder, environment);
            instructions.push(...valueInstructions);
            const identifier = environment.createIdentifier();
            const place = environment.createPlace(identifier);
            const instruction = environment.createInstruction(ObjectPropertyInstruction, place, nodePath, keyPlace, valuePlace, propertyPath.node.computed, propertyPath.node.shorthand);
            functionBuilder.addInstruction(instruction);
            return place;
        }
        throw new Error("Unsupported object pattern property");
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ObjectPatternInstruction, place, leftPath, propertyPlaces);
    functionBuilder.addInstruction(instruction);
    return { place, instructions };
}
function buildAssignmentPatternAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment) {
    const leftPath_ = leftPath.get("left");
    const { place: leftPlace, instructions } = buildAssignmentLeft(leftPath_, nodePath, functionBuilder, moduleBuilder, environment);
    const rightPath = leftPath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder, environment);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Assignment pattern right must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(AssignmentPatternInstruction, place, leftPath, leftPlace, rightPlace);
    functionBuilder.addInstruction(instruction);
    return { place, instructions };
}
function buildRestElementAssignmentLeft(leftPath, nodePath, functionBuilder, moduleBuilder, environment) {
    const argumentPath = leftPath.get("argument");
    const { place: argumentPlace, instructions: argumentInstructions } = buildAssignmentLeft(argumentPath, nodePath, functionBuilder, moduleBuilder, environment);
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(RestElementInstruction, place, leftPath, argumentPlace);
    functionBuilder.addInstruction(instruction);
    return { place, instructions: [...argumentInstructions] };
}
function buildAssignmentRight(nodePath, functionBuilder, moduleBuilder, environment) {
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder, environment);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Assignment expression right must be a single place");
    }
    const operator = nodePath.node.operator;
    if (operator === "=") {
        return rightPlace;
    }
    const binaryOperator = operator.slice(0, -1);
    const leftPath = nodePath.get("left");
    const leftPlace = buildNode(leftPath, functionBuilder, moduleBuilder, environment);
    if (leftPlace === undefined || Array.isArray(leftPlace)) {
        throw new Error("Assignment expression left must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    functionBuilder.addInstruction(environment.createInstruction(BinaryExpressionInstruction, place, nodePath, binaryOperator, leftPlace, rightPlace));
    return place;
}

export { buildAssignmentExpression };
//# sourceMappingURL=buildAssignmentExpression.js.map
