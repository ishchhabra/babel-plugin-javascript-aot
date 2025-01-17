import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  ObjectExpressionInstruction,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildObjectExpression(
  nodePath: NodePath<t.ObjectExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const propertiesPath = nodePath.get("properties");
  const propertyPlaces = propertiesPath.map((propertyPath) => {
    const propertyPlace = buildNode(
      propertyPath,
      functionBuilder,
      moduleBuilder,
    );
    if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
      throw new Error("Object expression property must be a single place");
    }

    return propertyPlace;
  });

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = createInstructionId(functionBuilder.environment);

  functionBuilder.currentBlock.instructions.push(
    new ObjectExpressionInstruction(
      instructionId,
      place,
      nodePath,
      propertyPlaces,
    ),
  );

  return place;
}
