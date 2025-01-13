import { NodePath } from "@babel/traverse";
import {
  createIdentifier,
  createPlace,
  HoleInstruction,
  makeInstructionId,
  Place,
} from "../../ir";
import { HIRBuilder } from "../HIRBuilder";

export function buildHole(
  expressionPath: NodePath<null>,
  builder: HIRBuilder,
): Place {
  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new HoleInstruction(instructionId, place, expressionPath),
  );

  return place;
}
