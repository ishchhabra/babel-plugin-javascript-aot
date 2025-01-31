import * as t from '@babel/types';
import { StoreLocalInstruction } from '../../../ir/instructions/memory/StoreLocal.js';
import { ArrayPatternInstruction } from '../../../ir/instructions/pattern/ArrayPattern.js';
import 'lodash-es';
import { buildBindingIdentifier } from '../buildIdentifier.js';
import { buildNode } from '../buildNode.js';

function buildVariableDeclaration(nodePath, functionBuilder, moduleBuilder, environment) {
    const declarations = nodePath.get("declarations");
    const declarationPlaces = declarations.map((declaration) => {
        const id = declaration.get("id");
        const { place: lvalPlace, identifiers: lvalIdentifiers } = buildVariableDeclaratorLVal(id, functionBuilder, environment);
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
function buildVariableDeclaratorLVal(nodePath, functionBuilder, environment) {
    if (nodePath.isIdentifier()) {
        return buildIdentifierVariableDeclaratorLVal(nodePath, functionBuilder, environment);
    }
    else if (nodePath.isArrayPattern()) {
        return buildArrayPatternVariableDeclaratorLVal(nodePath, functionBuilder, environment);
    }
    throw new Error("Unsupported variable declarator lval");
}
function buildIdentifierVariableDeclaratorLVal(nodePath, functionBuilder, environment) {
    const place = buildBindingIdentifier(nodePath, functionBuilder, environment);
    return { place, identifiers: [place] };
}
function buildArrayPatternVariableDeclaratorLVal(nodePath, functionBuilder, environment) {
    const identifiers = [];
    const elementPaths = nodePath.get("elements");
    const elementPlaces = elementPaths.map((elementPath) => {
        elementPath.assertLVal();
        const { place, identifiers: elementIdentifiers } = buildVariableDeclaratorLVal(elementPath, functionBuilder, environment);
        identifiers.push(...elementIdentifiers);
        return place;
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ArrayPatternInstruction, place, nodePath, elementPlaces);
    functionBuilder.addInstruction(instruction);
    return { place, identifiers };
}

export { buildVariableDeclaration };
//# sourceMappingURL=buildVariableDeclaration.js.map
