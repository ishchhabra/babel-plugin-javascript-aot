import * as t from '@babel/types';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { ArrayPatternInstruction } from '../../../ir/instructions/pattern/ArrayPattern.js';
import { HoleInstruction } from '../../../ir/instructions/value/Hole.js';
import { ObjectPropertyInstruction } from '../../../ir/instructions/value/ObjectProperty.js';
import { BindingIdentifierInstruction } from '../../../ir/instructions/BindingIdentifier.js';
import { RestElementInstruction } from '../../../ir/instructions/RestElement.js';
import 'lodash-es';
import { AssignmentPatternInstruction } from '../../../ir/instructions/pattern/AssignmentPattern.js';
import { ObjectPatternInstruction } from '../../../ir/instructions/pattern/ObjectPattern.js';
import { buildBindingIdentifier } from '../buildIdentifier.js';
import { buildNode } from '../buildNode.js';

function buildVariableDeclaration(nodePath, functionBuilder, moduleBuilder, environment) {
    const declarations = nodePath.get("declarations");
    const declarationPlaces = declarations.map((declaration) => {
        const id = declaration.get("id");
        const { place: lvalPlace, identifiers: lvalIdentifiers } = buildVariableDeclaratorLVal(id, functionBuilder, moduleBuilder, environment);
        if (lvalPlace === undefined || Array.isArray(lvalPlace)) {
            throw new Error("Lval place must be a single place");
        }
        const init = declaration.get("init");
        let valuePlace;
        if (!init.hasNode()) {
            init.replaceWith(t.identifier("undefined"));
            init.assertIdentifier({ name: "undefined" });
            valuePlace = buildNode(init, functionBuilder, moduleBuilder, environment);
        }
        else {
            valuePlace = buildNode(init, functionBuilder, moduleBuilder, environment);
        }
        if (valuePlace === undefined || Array.isArray(valuePlace)) {
            throw new Error("Value place must be a single place");
        }
        const identifier = environment.createIdentifier();
        const place = environment.createPlace(identifier);
        const instruction = environment.createInstruction(StoreLocalInstruction, place, nodePath, lvalPlace, valuePlace, "const");
        functionBuilder.addInstruction(instruction);
        lvalIdentifiers.forEach((identifier) => {
            environment.registerDeclarationInstruction(identifier, instruction);
        });
        return place;
    });
    return declarationPlaces;
}
function buildVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment) {
    if (nodePath.isIdentifier()) {
        return buildIdentifierVariableDeclaratorLVal(nodePath, functionBuilder, environment);
    }
    else if (nodePath.isArrayPattern()) {
        return buildArrayPatternVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment);
    }
    else if (nodePath.isObjectPattern()) {
        return buildObjectPatternVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment);
    }
    else if (nodePath.isAssignmentPattern()) {
        return buildAssignmentPatternVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment);
    }
    else if (nodePath.isRestElement()) {
        return buildRestElementVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment);
    }
    throw new Error("Unsupported variable declarator lval");
}
function buildIdentifierVariableDeclaratorLVal(nodePath, functionBuilder, environment) {
    const place = buildBindingIdentifier(nodePath, functionBuilder, environment);
    return { place, identifiers: [place] };
}
function buildArrayPatternVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment) {
    const identifiers = [];
    const elementPaths = nodePath.get("elements");
    const elementPlaces = elementPaths.map((elementPath) => {
        if (!elementPath.hasNode()) {
            const holeIdentifier = environment.createIdentifier();
            const holePlace = environment.createPlace(holeIdentifier);
            const instruction = environment.createInstruction(HoleInstruction, holePlace, elementPath);
            functionBuilder.addInstruction(instruction);
            return holePlace;
        }
        elementPath.assertLVal();
        const { place, identifiers: elementIdentifiers } = buildVariableDeclaratorLVal(elementPath, functionBuilder, moduleBuilder, environment);
        identifiers.push(...elementIdentifiers);
        return place;
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ArrayPatternInstruction, place, nodePath, elementPlaces);
    functionBuilder.addInstruction(instruction);
    return { place, identifiers };
}
function buildObjectPatternVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment) {
    const identifiers = [];
    const propertyPaths = nodePath.get("properties");
    const propertyPlaces = propertyPaths.map((propertyPath) => {
        if (propertyPath.isObjectProperty()) {
            const keyPath = propertyPath.get("key");
            keyPath.assertIdentifier();
            const keyPlace = buildObjectPropertyKeyVariableDeclaratorLVal(keyPath, functionBuilder, environment);
            if (keyPlace === undefined || Array.isArray(keyPlace)) {
                throw new Error("Object pattern key must be a single place");
            }
            const valuePath = propertyPath.get("value");
            valuePath.assertLVal();
            const { place: valuePlace, identifiers: valueIdentifiers } = buildVariableDeclaratorLVal(valuePath, functionBuilder, moduleBuilder, environment);
            identifiers.push(...valueIdentifiers);
            const identifier = environment.createIdentifier();
            const place = environment.createPlace(identifier);
            const instruction = environment.createInstruction(ObjectPropertyInstruction, place, nodePath, keyPlace, valuePlace, propertyPath.node.computed, false);
            functionBuilder.addInstruction(instruction);
            return place;
        }
        throw new Error("Unsupported object pattern property");
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ObjectPatternInstruction, place, nodePath, propertyPlaces);
    functionBuilder.addInstruction(instruction);
    return { place, identifiers };
}
function buildObjectPropertyKeyVariableDeclaratorLVal(nodePath, functionBuilder, environment) {
    // Not using `buildBindingIdentifier` because that defaults to using
    // existing place if it exists.
    const keyIdentifier = environment.createIdentifier();
    const keyPlace = environment.createPlace(keyIdentifier);
    const keyInstruction = environment.createInstruction(BindingIdentifierInstruction, keyPlace, nodePath, nodePath.node.name);
    functionBuilder.addInstruction(keyInstruction);
    return keyPlace;
}
function buildAssignmentPatternVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment) {
    const leftPath = nodePath.get("left");
    const { place: leftPlace, identifiers: leftIdentifiers } = buildVariableDeclaratorLVal(leftPath, functionBuilder, moduleBuilder, environment);
    const rightPath = nodePath.get("right");
    const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder, environment);
    if (rightPlace === undefined || Array.isArray(rightPlace)) {
        throw new Error("Right place must be a single place");
    }
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(AssignmentPatternInstruction, place, nodePath, leftPlace, rightPlace);
    functionBuilder.addInstruction(instruction);
    return { place, identifiers: leftIdentifiers };
}
function buildRestElementVariableDeclaratorLVal(nodePath, functionBuilder, moduleBuilder, environment) {
    const argumentPath = nodePath.get("argument");
    const { place: argumentPlace, identifiers: argumentIdentifiers } = buildVariableDeclaratorLVal(argumentPath, functionBuilder, moduleBuilder, environment);
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(RestElementInstruction, place, nodePath, argumentPlace);
    functionBuilder.addInstruction(instruction);
    return { place, identifiers: argumentIdentifiers };
}

export { buildVariableDeclaration };
//# sourceMappingURL=buildVariableDeclaration.js.map
