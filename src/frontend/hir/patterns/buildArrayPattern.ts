import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  ArrayPatternInstruction,
  createIdentifier,
  createInstructionId,
  createPlace,
  Place,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildArrayPattern(
  nodePath: NodePath<t.ArrayPattern>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place {
  const elementPaths = nodePath.get("elements");
  const elementPlaces = elementPaths.map((elementPath) => {
    const elementPlace = buildNode(elementPath, functionBuilder, moduleBuilder);
    if (elementPlace === undefined || Array.isArray(elementPlace)) {
      throw new Error("Array pattern element must be a single place");
    }

    return elementPlace;
  });

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = createInstructionId(functionBuilder.environment);

  functionBuilder.addInstruction(
    new ArrayPatternInstruction(instructionId, place, nodePath, elementPlaces),
  );

  return place;
}
