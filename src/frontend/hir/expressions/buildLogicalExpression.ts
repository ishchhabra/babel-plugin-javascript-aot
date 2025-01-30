import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { LogicalExpressionInstruction } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildLogicalExpression(
  nodePath: NodePath<t.LogicalExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const leftPath = nodePath.get("left");
  const leftPlace = buildNode(
    leftPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (leftPlace === undefined || Array.isArray(leftPlace)) {
    throw new Error("Logical expression left must be a single place");
  }

  const rightPath = nodePath.get("right");
  const rightPlace = buildNode(
    rightPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Logical expression right must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    LogicalExpressionInstruction,
    place,
    nodePath,
    nodePath.node.operator,
    leftPlace,
    rightPlace,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
