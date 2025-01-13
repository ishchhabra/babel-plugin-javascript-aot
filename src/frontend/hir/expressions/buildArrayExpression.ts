import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  ArrayExpressionInstruction,
  createIdentifier,
  createPlace,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildArrayExpression(
  nodePath: NodePath<t.ArrayExpression>,
  builder: HIRBuilder,
) {
  const elementsPath = nodePath.get("elements");
  const elementPlaces = elementsPath.map((elementPath) => {
    const elementPlace = buildNode(elementPath, builder);
    if (elementPlace === undefined || Array.isArray(elementPlace)) {
      throw new Error("Array expression element must be a single place");
    }

    return elementPlace;
  });

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new ArrayExpressionInstruction(
      instructionId,
      place,
      nodePath,
      elementPlaces,
    ),
  );

  return place;
}
