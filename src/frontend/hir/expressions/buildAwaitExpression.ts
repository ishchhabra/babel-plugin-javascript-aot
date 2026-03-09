import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { AwaitExpressionInstruction } from "../../../ir/instructions/value/AwaitExpression";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildAwaitExpression(
  nodePath: NodePath<t.AwaitExpression>,
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
    throw new Error("Await expression argument must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    AwaitExpressionInstruction,
    place,
    nodePath,
    argumentPlace,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
