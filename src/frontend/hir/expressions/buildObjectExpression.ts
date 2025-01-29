import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { createInstructionId, ObjectExpressionInstruction } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildObjectExpression(
  nodePath: NodePath<t.ObjectExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const propertiesPath = nodePath.get("properties");
  const propertyPlaces = propertiesPath.map((propertyPath) => {
    const propertyPlace = buildNode(
      propertyPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (propertyPlace === undefined || Array.isArray(propertyPlace)) {
      throw new Error("Object expression property must be a single place");
    }

    return propertyPlace;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instructionId = createInstructionId(environment);

  functionBuilder.addInstruction(
    new ObjectExpressionInstruction(
      instructionId,
      place,
      nodePath,
      propertyPlaces,
    ),
  );

  return place;
}
