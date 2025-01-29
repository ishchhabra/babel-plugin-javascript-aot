import { NodePath } from "@babel/traverse";
import { Environment } from "../../environment";
import { createInstructionId, HoleInstruction, Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

export function buildHole(
  expressionPath: NodePath<null>,
  builder: FunctionIRBuilder,
  environment: Environment,
): Place {
  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instructionId = createInstructionId(environment);

  builder.addInstruction(
    new HoleInstruction(instructionId, place, expressionPath),
  );

  return place;
}
