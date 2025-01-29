import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BinaryExpressionInstruction, makeInstructionId } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildBinaryExpression(
  nodePath: NodePath<t.BinaryExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const leftPath: NodePath<t.PrivateName | t.Expression> = nodePath.get("left");
  leftPath.assertExpression();
  const leftPlace = buildNode(
    leftPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (leftPlace === undefined || Array.isArray(leftPlace)) {
    throw new Error("Binary expression left must be a single place");
  }

  const rightPath = nodePath.get("right");
  const rightPlace = buildNode(
    rightPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Binary expression right must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instructionId = makeInstructionId(environment.nextInstructionId++);

  functionBuilder.addInstruction(
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
