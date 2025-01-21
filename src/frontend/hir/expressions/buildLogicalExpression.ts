import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  LogicalExpressionInstruction,
  makeInstructionId,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildLogicalExpression(
  nodePath: NodePath<t.LogicalExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const leftPath = nodePath.get("left");
  const leftPlace = buildNode(leftPath, functionBuilder, moduleBuilder);
  if (leftPlace === undefined || Array.isArray(leftPlace)) {
    throw new Error("Logical expression left must be a single place");
  }

  const rightPath = nodePath.get("right");
  const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Logical expression right must be a single place");
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  functionBuilder.addInstruction(
    new LogicalExpressionInstruction(
      instructionId,
      place,
      nodePath,
      nodePath.node.operator,
      leftPlace,
      rightPlace,
    ),
  );

  return place;
}
