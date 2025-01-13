import * as t from "@babel/types";
import { CopyInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateCopyInstruction(
  instruction: CopyInstruction,
  generator: CodeGenerator,
): t.Node {
  const lval = t.identifier(instruction.lval.identifier.name);
  const value = generator.places.get(instruction.value.id);
  if (value === undefined) {
    throw new Error(`Place ${instruction.value.id} not found`);
  }

  t.assertExpression(value);

  const node = t.assignmentExpression("=", lval, value);
  generator.places.set(instruction.place.id, node);
  return node;
}
