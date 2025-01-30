import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { ArrayPatternInstruction, Place } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildArrayPattern(
  nodePath: NodePath<t.ArrayPattern>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const elementPaths = nodePath.get("elements");
  const elementPlaces = elementPaths.map((elementPath) => {
    const elementPlace = buildNode(
      elementPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (elementPlace === undefined || Array.isArray(elementPlace)) {
      throw new Error("Array pattern element must be a single place");
    }

    return elementPlace;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ArrayPatternInstruction,
    place,
    nodePath,
    elementPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
