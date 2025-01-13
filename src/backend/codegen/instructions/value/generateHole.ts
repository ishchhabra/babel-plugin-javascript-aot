import { HoleInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateHoleInstruction(
  instruction: HoleInstruction,
  generator: CodeGenerator,
): null {
  const node = null;
  generator.places.set(instruction.place.id, node);
  return node;
}
