import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { RegExpLiteralInstruction } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildRegExpLiteral(
  expressionPath: NodePath<t.RegExpLiteral>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
) {
  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    RegExpLiteralInstruction,
    place,
    expressionPath,
    expressionPath.node.pattern,
    expressionPath.node.flags,
  );
  functionBuilder.addInstruction(instruction);
  environment.registerDeclarationInstruction(place, instruction);
  return place;
}
