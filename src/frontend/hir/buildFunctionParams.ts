import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import {
  ArrayPatternInstruction,
  BindingIdentifierInstruction,
  ObjectPropertyInstruction,
  Place,
  RestElementInstruction,
} from "../../ir";
import { AssignmentPatternInstruction } from "../../ir/instructions/pattern/AssignmentPattern";
import { ObjectPatternInstruction } from "../../ir/instructions/pattern/ObjectPattern";
import { buildNode } from "./buildNode";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export function buildFunctionParams(
  paramPaths: NodePath<t.Identifier | t.RestElement | t.Pattern>[],
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place[] {
  return paramPaths.map(
    (paramPath: NodePath<t.Identifier | t.RestElement | t.Pattern>) =>
      buildFunctionParam(
        paramPath as NodePath<t.LVal>,
        bodyPath,
        functionBuilder,
        moduleBuilder,
        environment,
      ),
  );
}

function buildFunctionParam(
  paramPath: NodePath<t.LVal>,
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  if (paramPath.isIdentifier()) {
    return buildFunctionIdentifierParam(
      paramPath,
      bodyPath,
      functionBuilder,
      environment,
    );
  } else if (paramPath.isArrayPattern()) {
    return buildFunctionArrayPatternParam(
      paramPath,
      bodyPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  } else if (paramPath.isObjectPattern()) {
    return buildFunctionObjectPatternParam(
      paramPath,
      bodyPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  } else if (paramPath.isAssignmentPattern()) {
    return buildFunctionAssignmentPatternParam(
      paramPath,
      bodyPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  } else if (paramPath.isRestElement()) {
    return buildFunctionRestElementParam(
      paramPath,
      bodyPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }

  throw new Error(`Unsupported param type: ${paramPath.node.type}`);
}

function buildFunctionIdentifierParam(
  paramPath: NodePath<t.Identifier>,
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): Place {
  const name = paramPath.node.name;
  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    BindingIdentifierInstruction,
    place,
    paramPath,
    identifier.name,
  );
  functionBuilder.header.push(instruction);

  const declarationId = identifier.declarationId;
  functionBuilder.registerDeclarationName(name, declarationId, bodyPath);
  bodyPath.scope.rename(name, identifier.name);
  functionBuilder.registerDeclarationName(
    identifier.name,
    declarationId,
    bodyPath,
  );
  environment.registerDeclaration(
    declarationId,
    functionBuilder.currentBlock.id,
    place.id,
  );
  return place;
}

function buildFunctionArrayPatternParam(
  paramPath: NodePath<t.ArrayPattern>,
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const elements = paramPath.get("elements");
  const places = elements.map((elementPath) => {
    if (
      !(
        elementPath.isIdentifier() ||
        elementPath.isRestElement() ||
        elementPath.isPattern()
      )
    ) {
      throw new Error(`Unsupported element type: ${elementPath.node!.type}`);
    }

    return buildFunctionParam(
      elementPath as NodePath<t.LVal>,
      bodyPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ArrayPatternInstruction,
    place,
    paramPath,
    places,
  );
  functionBuilder.header.push(instruction);
  return place;
}

function buildFunctionObjectPatternParam(
  paramPath: NodePath<t.ObjectPattern>,
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const propertyPaths = paramPath.get("properties");
  const propertyPlaces = propertyPaths.map((propertyPath) => {
    if (propertyPath.isObjectProperty()) {
      const keyPath = propertyPath.get("key");
      const keyPlace = buildFunctionObjectPropertyKey(
        keyPath as NodePath<t.Identifier>,
        functionBuilder,
        environment,
      );
      if (keyPlace === undefined || Array.isArray(keyPlace)) {
        throw new Error("Object pattern key must be a single place");
      }

      const valuePath = propertyPath.get("value");
      const valuePlace = buildFunctionParam(
        valuePath as NodePath<t.LVal>,
        bodyPath,
        functionBuilder,
        moduleBuilder,
        environment,
      );

      const identifier = environment.createIdentifier();
      const place = environment.createPlace(identifier);
      const instruction = environment.createInstruction(
        ObjectPropertyInstruction,
        place,
        paramPath,
        keyPlace,
        valuePlace,
        propertyPath.node.computed,
        propertyPath.node.shorthand,
      );
      functionBuilder.header.push(instruction);
      return place;
    }

    if (propertyPath.isRestElement()) {
      const argumentPath = propertyPath.get("argument");
      const argumentPlace = buildFunctionParam(
        argumentPath as NodePath<t.LVal>,
        bodyPath,
        functionBuilder,
        moduleBuilder,
        environment,
      );

      const identifier = environment.createIdentifier();
      const place = environment.createPlace(identifier);
      const instruction = environment.createInstruction(
        RestElementInstruction,
        place,
        propertyPath,
        argumentPlace,
      );
      functionBuilder.header.push(instruction);
      return place;
    }

    throw new Error("Unsupported object pattern property");
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ObjectPatternInstruction,
    place,
    paramPath,
    propertyPlaces,
  );
  functionBuilder.header.push(instruction);
  return place;
}

function buildFunctionObjectPropertyKey(
  keyPath: NodePath<t.Identifier>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): Place {
  // Not using `buildBindingIdentifier` because that defaults to using
  // existing place if it exists.
  const keyIdentifier = environment.createIdentifier();
  const keyPlace = environment.createPlace(keyIdentifier);
  const keyInstruction = environment.createInstruction(
    BindingIdentifierInstruction,
    keyPlace,
    keyPath,
    keyPath.node.name,
  );
  functionBuilder.header.push(keyInstruction);
  return keyPlace;
}

function buildFunctionAssignmentPatternParam(
  paramPath: NodePath<t.AssignmentPattern>,
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const leftPath = paramPath.get("left");
  const leftPlace = buildFunctionParam(
    leftPath as NodePath<t.LVal>,
    bodyPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );

  // buildNode emits instructions into the current block, but param
  // instructions must live in the function header for codegen to resolve
  // places during param generation. We splice the newly added instructions
  // from the block into the header.
  const insertPoint = functionBuilder.currentBlock.instructions.length;
  const rightPath = paramPath.get("right");
  const rightPlace = buildNode(
    rightPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Default value must be a single expression");
  }
  const defaultValueInstructions =
    functionBuilder.currentBlock.instructions.splice(insertPoint);
  functionBuilder.header.push(...defaultValueInstructions);

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    AssignmentPatternInstruction,
    place,
    paramPath,
    leftPlace,
    rightPlace,
  );
  functionBuilder.header.push(instruction);
  return place;
}

function buildFunctionRestElementParam(
  paramPath: NodePath<t.RestElement>,
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const argumentPath = paramPath.get("argument");
  const argumentPlace = buildFunctionParam(
    argumentPath as NodePath<t.LVal>,
    bodyPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    RestElementInstruction,
    place,
    paramPath,
    argumentPlace,
  );
  functionBuilder.header.push(instruction);
  return place;
}
