import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { ArrayExpressionInstruction, makeInstructionId } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildArrayExpression(
  nodePath: NodePath<t.ArrayExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const elementsPath = nodePath.get("elements");
  const elementPlaces = elementsPath.map((elementPath) => {
    const elementPlace = buildNode(
      elementPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (elementPlace === undefined || Array.isArray(elementPlace)) {
      throw new Error("Array expression element must be a single place");
    }

    return elementPlace;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instructionId = makeInstructionId(environment.nextInstructionId++);

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
