import { ArrayPatternInstruction } from '../../ir/instructions/pattern/ArrayPattern.js';
import 'lodash-es';
import { ObjectPropertyInstruction } from '../../ir/instructions/value/ObjectProperty.js';
import { BindingIdentifierInstruction } from '../../ir/instructions/BindingIdentifier.js';
import { RestElementInstruction } from '../../ir/instructions/RestElement.js';
import { ObjectPatternInstruction } from '../../ir/instructions/pattern/ObjectPattern.js';

function buildFunctionParams(paramPaths, bodyPath, functionBuilder, moduleBuilder, environment) {
    return paramPaths.map((paramPath) => buildFunctionParam(paramPath, bodyPath, functionBuilder, moduleBuilder, environment));
}
function buildFunctionParam(paramPath, bodyPath, functionBuilder, moduleBuilder, environment) {
    if (paramPath.isIdentifier()) {
        return buildFunctionIdentifierParam(paramPath, bodyPath, functionBuilder, environment);
    }
    else if (paramPath.isArrayPattern()) {
        return buildFunctionArrayPatternParam(paramPath, bodyPath, functionBuilder, moduleBuilder, environment);
    }
    else if (paramPath.isObjectPattern()) {
        return buildFunctionObjectPatternParam(paramPath, bodyPath, functionBuilder, moduleBuilder, environment);
    }
    else if (paramPath.isRestElement()) {
        return buildFunctionRestElementParam(paramPath, bodyPath, functionBuilder, moduleBuilder, environment);
    }
    throw new Error(`Unsupported param type: ${paramPath.node.type}`);
}
function buildFunctionIdentifierParam(paramPath, bodyPath, functionBuilder, environment) {
    const name = paramPath.node.name;
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(BindingIdentifierInstruction, place, paramPath, identifier.name);
    functionBuilder.header.push(instruction);
    const declarationId = identifier.declarationId;
    functionBuilder.registerDeclarationName(name, declarationId, bodyPath);
    environment.registerDeclaration(declarationId, functionBuilder.currentBlock.id, place.id);
    return place;
}
function buildFunctionArrayPatternParam(paramPath, bodyPath, functionBuilder, moduleBuilder, environment) {
    const elements = paramPath.get("elements");
    const places = elements.map((elementPath) => {
        if (!(elementPath.isIdentifier() ||
            elementPath.isRestElement() ||
            elementPath.isPattern())) {
            throw new Error(`Unsupported element type: ${elementPath.node.type}`);
        }
        return buildFunctionParam(elementPath, bodyPath, functionBuilder, moduleBuilder, environment);
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ArrayPatternInstruction, place, paramPath, places);
    functionBuilder.header.push(instruction);
    return place;
}
function buildFunctionObjectPatternParam(paramPath, bodyPath, functionBuilder, moduleBuilder, environment) {
    const propertyPaths = paramPath.get("properties");
    const propertyPlaces = propertyPaths.map((propertyPath) => {
        if (propertyPath.isObjectProperty()) {
            const keyPath = propertyPath.get("key");
            const keyPlace = buildFunctionObjectPropertyKey(keyPath, functionBuilder, environment);
            if (keyPlace === undefined || Array.isArray(keyPlace)) {
                throw new Error("Object pattern key must be a single place");
            }
            const valuePath = propertyPath.get("value");
            const valuePlace = buildFunctionParam(valuePath, bodyPath, functionBuilder, moduleBuilder, environment);
            const identifier = environment.createIdentifier();
            const place = environment.createPlace(identifier);
            const instruction = environment.createInstruction(ObjectPropertyInstruction, place, paramPath, keyPlace, valuePlace, propertyPath.node.computed, propertyPath.node.shorthand);
            functionBuilder.header.push(instruction);
            return place;
        }
        throw new Error("Unsupported object pattern property");
    });
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(ObjectPatternInstruction, place, paramPath, propertyPlaces);
    functionBuilder.header.push(instruction);
    return place;
}
function buildFunctionObjectPropertyKey(keyPath, functionBuilder, environment) {
    // Not using `buildBindingIdentifier` because that defaults to using
    // existing place if it exists.
    const keyIdentifier = environment.createIdentifier();
    const keyPlace = environment.createPlace(keyIdentifier);
    const keyInstruction = environment.createInstruction(BindingIdentifierInstruction, keyPlace, keyPath, keyPath.node.name);
    functionBuilder.header.push(keyInstruction);
    return keyPlace;
}
function buildFunctionRestElementParam(paramPath, bodyPath, functionBuilder, moduleBuilder, environment) {
    const argumentPath = paramPath.get("argument");
    const argumentPlace = buildFunctionParam(argumentPath, bodyPath, functionBuilder, moduleBuilder, environment);
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(RestElementInstruction, place, paramPath, argumentPlace);
    functionBuilder.header.push(instruction);
    return place;
}

export { buildFunctionParams };
//# sourceMappingURL=buildFunctionParams.js.map
