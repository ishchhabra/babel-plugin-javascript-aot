import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { Place } from "../../../ir";
import { ArrowFunctionExpressionInstruction } from "../../../ir/instructions/value/ArrowFunctionExpression";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildArrowFunctionExpression(
  nodePath: NodePath<t.ArrowFunctionExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const paramPaths = nodePath.get("params");
  const bodyPath = nodePath.get("body");
  const functionIR = new FunctionIRBuilder(
    paramPaths,
    bodyPath,
    functionBuilder.environment,
    moduleBuilder,
  ).build();

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ArrowFunctionExpressionInstruction,
    place,
    nodePath,
    functionIR,
    nodePath.node.async,
    bodyPath.isExpression(),
    false,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
