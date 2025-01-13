import * as t from "@babel/types";
import { SpreadElementInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateSpreadElementInstruction(
  instruction: SpreadElementInstruction,
  builder: CodeGenerator,
) {
  const argumentPlace = builder.places.get(instruction.argument.id);
  if (argumentPlace === undefined) {
    throw new Error(`Place ${instruction.argument.id} not found`);
  }

  t.assertExpression(argumentPlace);
  const node = t.spreadElement(argumentPlace);
  builder.places.set(instruction.place.id, node);
  return node;
}
