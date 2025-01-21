import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  ObjectPropertyInstruction,
} from "../../ir";
import { buildNode } from "./buildNode";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export function buildObjectProperty(
  nodePath: NodePath<t.ObjectProperty>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const keyPath = nodePath.get("key");
  const keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder);
  if (keyPlace === undefined || Array.isArray(keyPlace)) {
    throw new Error(`Object property key must be a single place`);
  }

  const valuePath = nodePath.get("value");
  const valuePlace = buildNode(valuePath, functionBuilder, moduleBuilder);
  if (valuePlace === undefined || Array.isArray(valuePlace)) {
    throw new Error(`Object property value must be a single place`);
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);

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
