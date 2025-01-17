import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  BinaryExpressionInstruction,
  createIdentifier,
  createPlace,
  makeInstructionId,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildBinaryExpression(
  nodePath: NodePath<t.BinaryExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const leftPath: NodePath<t.PrivateName | t.Expression> = nodePath.get("left");
  leftPath.assertExpression();
  const leftPlace = buildNode(leftPath, functionBuilder, moduleBuilder);
  if (leftPlace === undefined || Array.isArray(leftPlace)) {
    throw new Error("Binary expression left must be a single place");
  }

  const rightPath = nodePath.get("right");
  const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Binary expression right must be a single place");
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  functionBuilder.currentBlock.instructions.push(
    new BinaryExpressionInstruction(
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
