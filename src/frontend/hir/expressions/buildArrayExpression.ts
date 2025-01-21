import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  ArrayExpressionInstruction,
  createIdentifier,
  createPlace,
  makeInstructionId,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildArrayExpression(
  nodePath: NodePath<t.ArrayExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const elementsPath = nodePath.get("elements");
  const elementPlaces = elementsPath.map((elementPath) => {
    const elementPlace = buildNode(elementPath, functionBuilder, moduleBuilder);
    if (elementPlace === undefined || Array.isArray(elementPlace)) {
      throw new Error("Array expression element must be a single place");
    }

    return elementPlace;
  });

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  functionBuilder.addInstruction(
    new ArrayExpressionInstruction(
      instructionId,
      place,
      nodePath,
      elementPlaces,
    ),
  );

  return place;
}
