import * as t from "@babel/types";
import { ObjectPropertyInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateObjectPropertyInstruction(
  instruction: ObjectPropertyInstruction,
  generator: CodeGenerator,
): t.ObjectProperty {
  const key = generator.places.get(instruction.key.id);
  if (key === undefined) {
    throw new Error(`Place ${instruction.key.id} not found`);
  }

  const value = generator.places.get(instruction.value.id);
  if (value === undefined) {
    throw new Error(`Place ${instruction.value.id} not found`);
  }

  t.assertExpression(key);
  if (!(t.isExpression(value) || t.isPatternLike(value))) {
    throw new Error(
      `Value ${instruction.value.id} is not an expression or pattern`,
    );
  }

  const node = t.objectProperty(key, value);
  generator.places.set(instruction.place.id, node);
  return node;
}
