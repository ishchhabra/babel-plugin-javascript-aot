import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
} from "../../../ir";
import { FunctionExpressionInstruction } from "../../../ir/instructions/value/FunctionExpression";
import { buildIdentifier } from "../buildIdentifier";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildFunctionExpression(
  nodePath: NodePath<t.FunctionExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const idPath: NodePath<t.FunctionExpression["id"]> = nodePath.get("id");
  idPath.assertIdentifier();

  console.log(
    `Building function expression ${idPath.node.name} ${idPath.type}`,
  );
  const identifierPlace = buildIdentifier(idPath, functionBuilder);

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
    new FunctionExpressionInstruction(
      createInstructionId(functionBuilder.environment),
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
