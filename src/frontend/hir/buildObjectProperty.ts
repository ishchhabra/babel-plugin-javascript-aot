import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import {
  BindingIdentifierInstruction,
  ObjectPropertyInstruction,
} from "../../ir";
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
  let keyPlace;
  if (!nodePath.node.computed && keyPath.isIdentifier()) {
    // Non-computed identifier keys are property labels, not variable
    // references. Create a fresh BI to avoid colliding with same-named
    // variable declarations.
    const keyIdentifier = environment.createIdentifier();
    keyPlace = environment.createPlace(keyIdentifier);
    const keyInstruction = environment.createInstruction(
      BindingIdentifierInstruction,
      keyPlace,
      keyPath,
      keyPath.node.name,
    );
    functionBuilder.addInstruction(keyInstruction);
  } else {
    keyPlace = buildNode(keyPath, functionBuilder, moduleBuilder, environment);
    if (keyPlace === undefined || Array.isArray(keyPlace)) {
      throw new Error(`Object property key must be a single place`);
    }
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
  const instruction = environment.createInstruction(
    ObjectPropertyInstruction,
    place,
    nodePath,
    keyPlace,
    valuePlace,
    nodePath.node.computed,
    nodePath.node.shorthand,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
