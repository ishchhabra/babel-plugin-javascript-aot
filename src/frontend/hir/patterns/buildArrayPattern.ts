import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  ArrayPatternInstruction,
  createIdentifier,
  createPlace,
  makeInstructionId,
  Place,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildArrayPattern(
  nodePath: NodePath<t.ArrayPattern>,
  builder: HIRBuilder,
): Place {
  const elementPaths = nodePath.get("elements");
  const elementPlaces = elementPaths.map((elementPath) => {
    const elementPlace = buildNode(elementPath, builder);
    if (elementPlace === undefined || Array.isArray(elementPlace)) {
      throw new Error("Array pattern element must be a single place");
    }

    return elementPlace;
  });

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new ArrayPatternInstruction(instructionId, place, nodePath, elementPlaces),
  );

  return place;
}
