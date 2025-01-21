import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  UnaryExpressionInstruction,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildUnaryExpression(
  nodePath: NodePath<t.UnaryExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const argumentPath = nodePath.get("argument");
  const argumentPlace = buildNode(argumentPath, functionBuilder, moduleBuilder);
  if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
    throw new Error("Unary expression argument must be a single place");
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = createInstructionId(functionBuilder.environment);

  functionBuilder.addInstruction(
    new UnaryExpressionInstruction(
      instructionId,
      place,
      nodePath,
      nodePath.node.operator,
      argumentPlace,
    ),
  );

  return place;
}
