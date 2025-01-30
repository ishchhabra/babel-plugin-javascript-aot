import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import {
  ArrayPatternInstruction,
  Place,
  StoreLocalInstruction,
} from "../../../ir";
import { buildBindingIdentifier } from "../buildIdentifier";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildVariableDeclaration(
  nodePath: NodePath<t.VariableDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place | Place[] | undefined {
  const declarations = nodePath.get("declarations");
  const declarationPlaces = declarations.map((declaration) => {
    const id = declaration.get("id");
    const { place: lvalPlace, identifiers: lvalIdentifiers } =
      buildVariableDeclaratorLVal(id, functionBuilder, environment);
    if (lvalPlace === undefined || Array.isArray(lvalPlace)) {
      throw new Error("Lval place must be a single place");
    }

    const init: NodePath<t.Expression | null | undefined> =
      declaration.get("init");
    let valuePlace: Place | Place[] | undefined;
    if (!init.hasNode()) {
      init.replaceWith(t.identifier("undefined"));
      init.assertIdentifier({ name: "undefined" });
      valuePlace = buildNode(init, functionBuilder, moduleBuilder, environment);
    } else {
      valuePlace = buildNode(init, functionBuilder, moduleBuilder, environment);
    }
    if (valuePlace === undefined || Array.isArray(valuePlace)) {
      throw new Error("Value place must be a single place");
    }

    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(
      StoreLocalInstruction,
      place,
      nodePath,
      lvalPlace,
      valuePlace,
      "const",
    );
    functionBuilder.addInstruction(instruction);

    for (const identifier of lvalIdentifiers) {
      functionBuilder.environment.declToDeclInstrPlace.set(
        identifier.identifier.declarationId,
        place.id,
      );
    }

    return place;
  });

  return declarationPlaces;
}

function buildVariableDeclaratorLVal(
  nodePath: NodePath<t.LVal>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): { place: Place; identifiers: Place[] } {
  if (nodePath.isIdentifier()) {
    return buildIdentifierVariableDeclaratorLVal(
      nodePath,
      functionBuilder,
      environment,
    );
  } else if (nodePath.isArrayPattern()) {
    return buildArrayPatternVariableDeclaratorLVal(
      nodePath,
      functionBuilder,
      environment,
    );
  }

  throw new Error("Unsupported variable declarator lval");
}

function buildIdentifierVariableDeclaratorLVal(
  nodePath: NodePath<t.Identifier>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): { place: Place; identifiers: Place[] } {
  const place = buildBindingIdentifier(nodePath, functionBuilder, environment);
  functionBuilder.environment.declToDeclInstrPlace.set(
    place.identifier.declarationId,
    place.id,
  );
  return { place, identifiers: [place] };
}

function buildArrayPatternVariableDeclaratorLVal(
  nodePath: NodePath<t.ArrayPattern>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): { place: Place; identifiers: Place[] } {
  const identifiers: Place[] = [];

  const elementPaths = nodePath.get("elements");
  const elementPlaces = elementPaths.map(
    (elementPath: NodePath<t.ArrayPattern["elements"][number]>) => {
      elementPath.assertLVal();
      const { place, identifiers: elementIdentifiers } =
        buildVariableDeclaratorLVal(elementPath, functionBuilder, environment);
      identifiers.push(...elementIdentifiers);
      return place;
    },
  );

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ArrayPatternInstruction,
    place,
    nodePath,
    elementPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return { place, identifiers };
}
