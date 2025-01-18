import * as t from "@babel/types";
import { LoadPhiInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateLoadPhiInstruction(
  instruction: LoadPhiInstruction,
  generator: CodeGenerator,
): t.Expression {
  console.warn(
    `Generating LoadPhiInstruction for ${instruction.value.identifier.name}`,
  );
  const node = t.identifier(instruction.value.identifier.name);
  generator.places.set(instruction.place.id, node);
  return node;
}
