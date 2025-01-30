import { NodePath } from "@babel/traverse";
import { Environment } from "../../environment";
import { HoleInstruction, Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

export function buildHole(
  expressionPath: NodePath<null>,
  builder: FunctionIRBuilder,
  environment: Environment,
): Place {
  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    HoleInstruction,
    place,
    expressionPath,
  );
  builder.addInstruction(instruction);
  return place;
}
