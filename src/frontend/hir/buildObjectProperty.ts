import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { makeInstructionId, ObjectPropertyInstruction } from "../../ir";
import { buildNode } from "./buildNode";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export function buildObjectProperty(
  nodePath: NodePath<t.ObjectProperty>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const keyPath = nodePath.get("key");
  const keyPlace = buildNode(
    keyPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (keyPlace === undefined || Array.isArray(keyPlace)) {
    throw new Error(`Object property key must be a single place`);
  }

  const valuePath = nodePath.get("value");
  const valuePlace = buildNode(
    valuePath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (valuePlace === undefined || Array.isArray(valuePlace)) {
    throw new Error(`Object property value must be a single place`);
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);

  functionBuilder.addInstruction(
    new ObjectPropertyInstruction(
      makeInstructionId(functionBuilder.environment.nextInstructionId++),
      place,
      nodePath,
      keyPlace,
      valuePlace,
      nodePath.node.computed,
      nodePath.node.shorthand,
    ),
  );

  return place;
}
