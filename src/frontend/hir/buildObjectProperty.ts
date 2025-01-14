import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  ObjectPropertyInstruction,
} from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
import { buildNode } from "./buildNode";

export function buildObjectProperty(
  nodePath: NodePath<t.ObjectProperty>,
  builder: HIRBuilder,
) {
  const keyPath = nodePath.get("key");
  const keyPlace = buildNode(keyPath, builder);
  if (keyPlace === undefined || Array.isArray(keyPlace)) {
    throw new Error(`Object property key must be a single place`);
  }

  const valuePath = nodePath.get("value");
  const valuePlace = buildNode(valuePath, builder);
  if (valuePlace === undefined || Array.isArray(valuePlace)) {
    throw new Error(`Object property value must be a single place`);
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);

  builder.currentBlock.instructions.push(
    new ObjectPropertyInstruction(
      makeInstructionId(builder.environment.nextInstructionId++),
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
