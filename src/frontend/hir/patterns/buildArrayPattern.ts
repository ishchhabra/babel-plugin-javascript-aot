import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import {
  ArrayPatternInstruction,
  createInstructionId,
  Place,
} from "../../../ir";
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
  const instructionId = createInstructionId(environment);

  functionBuilder.addInstruction(
    new ArrayPatternInstruction(instructionId, place, nodePath, elementPlaces),
  );

  return place;
}
