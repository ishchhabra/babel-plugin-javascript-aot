import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { LiteralInstruction } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildLiteral(
  expressionPath: NodePath<t.Literal>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  if (
    !t.isNumericLiteral(expressionPath.node) &&
    !t.isStringLiteral(expressionPath.node) &&
    !t.isBooleanLiteral(expressionPath.node)
  ) {
    throw new Error(`Unsupported literal type: ${expressionPath.type}`);
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    LiteralInstruction,
    place,
    expressionPath,
    expressionPath.node.value,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
