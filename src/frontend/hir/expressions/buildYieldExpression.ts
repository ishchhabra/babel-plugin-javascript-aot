import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { YieldExpressionInstruction } from "../../../ir/instructions/value/YieldExpression";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildYieldExpression(
  nodePath: NodePath<t.YieldExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const argumentPath = nodePath.get("argument");
  let argumentPlace;
  if (argumentPath.hasNode()) {
    argumentPlace = buildNode(
      argumentPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
      throw new Error("Yield expression argument must be a single place");
    }
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    YieldExpressionInstruction,
    place,
    nodePath,
    argumentPlace,
    nodePath.node.delegate,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
