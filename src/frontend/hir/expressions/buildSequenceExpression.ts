import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { SequenceExpressionInstruction } from "../../../ir/instructions/value/SequenceExpression";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildSequenceExpression(
  nodePath: NodePath<t.SequenceExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const expressionPaths = nodePath.get("expressions");
  const expressionPlaces = expressionPaths.map((exprPath) => {
    const exprPlace = buildNode(
      exprPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (exprPlace === undefined || Array.isArray(exprPlace)) {
      throw new Error("Sequence expression element must be a single place");
    }
    return exprPlace;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    SequenceExpressionInstruction,
    place,
    nodePath,
    expressionPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
