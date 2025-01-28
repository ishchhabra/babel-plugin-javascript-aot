import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  Place,
} from "../../../ir";
import { ArrowFunctionExpressionInstruction } from "../../../ir/instructions/value/ArrowFunctionExpression";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildArrowFunctionExpression(
  nodePath: NodePath<t.ArrowFunctionExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place {
  const paramPaths = nodePath.get("params");
  const bodyPath = nodePath.get("body");
  const functionIR = new FunctionIRBuilder(
    paramPaths,
    bodyPath,
    functionBuilder.environment,
    moduleBuilder,
  ).build();

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);

  functionBuilder.addInstruction(
    new ArrowFunctionExpressionInstruction(
      createInstructionId(functionBuilder.environment),
      place,
      nodePath,
      functionIR,
      nodePath.node.async,
      bodyPath.isExpression(),
      false,
    ),
  );
  return place;
}
