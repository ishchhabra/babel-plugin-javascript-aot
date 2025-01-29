import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { createInstructionId } from "../../../ir";
import { FunctionExpressionInstruction } from "../../../ir/instructions/value/FunctionExpression";
import { buildIdentifier } from "../buildIdentifier";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildFunctionExpression(
  nodePath: NodePath<t.FunctionExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const idPath: NodePath<t.FunctionExpression["id"]> = nodePath.get("id");
  if (idPath.hasNode() && !idPath.isIdentifier()) {
    throw new Error("Function expression identifier is not an identifier");
  }

  const identifierPlace = idPath.hasNode()
    ? buildIdentifier(idPath, functionBuilder, environment)
    : null;

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
  functionBuilder.addInstruction(
    new FunctionExpressionInstruction(
      createInstructionId(environment),
      place,
      nodePath,
      identifierPlace,
      functionIR,
      nodePath.node.generator,
      nodePath.node.async,
    ),
  );
  return place;
}
