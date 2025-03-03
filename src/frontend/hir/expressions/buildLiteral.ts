import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { LiteralInstruction, TPrimitiveValue } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildLiteral(
  expressionPath: NodePath<t.Literal>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  const value = nodeToValue(expressionPath.node);

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    LiteralInstruction,
    place,
    expressionPath,
    value,
  );
  functionBuilder.addInstruction(instruction);
  environment.registerDeclarationInstruction(place, instruction);
  return place;
}

function nodeToValue(node: t.Literal): TPrimitiveValue {
  switch (node.type) {
    case "BooleanLiteral":
    case "NumericLiteral":
    case "StringLiteral":
      return node.value;
    case "NullLiteral":
      return null;
    case "BigIntLiteral":
      return BigInt(node.value);
  }

  throw new Error(`Unsupported literal type: ${node.type}`);
}
