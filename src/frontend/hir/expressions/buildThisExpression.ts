import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { ThisExpressionInstruction } from "../../../ir/instructions/value/ThisExpression";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildThisExpression(
  nodePath: NodePath<t.ThisExpression>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ThisExpressionInstruction,
    place,
    nodePath,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
