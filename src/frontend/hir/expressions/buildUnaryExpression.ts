import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { createInstructionId, UnaryExpressionInstruction } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildUnaryExpression(
  nodePath: NodePath<t.UnaryExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const argumentPath = nodePath.get("argument");
  const argumentPlace = buildNode(
    argumentPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
    throw new Error("Unary expression argument must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instructionId = createInstructionId(environment);

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
