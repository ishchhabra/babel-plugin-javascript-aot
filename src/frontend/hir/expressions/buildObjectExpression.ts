import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  ObjectExpressionInstruction,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildObjectExpression(
  nodePath: NodePath<t.ObjectExpression>,
  builder: HIRBuilder,
) {
  const propertiesPath = nodePath.get("properties");
  const propertyPlaces = propertiesPath.map((propertyPath) => {
    const propertyPlace = buildNode(propertyPath, builder);
    if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
      throw new Error("Object expression property must be a single place");
    }

    return propertyPlace;
  });

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new ObjectExpressionInstruction(
      instructionId,
      place,
      nodePath,
      propertyPlaces,
    ),
  );

  return place;
}
