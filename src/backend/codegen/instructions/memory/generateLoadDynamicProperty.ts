import * as t from "@babel/types";
import { LoadDynamicPropertyInstruction } from "../../../../ir/instructions/memory/LoadDynamicProperty";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateLoadDynamicPropertyInstruction(
  instruction: LoadDynamicPropertyInstruction,
  generator: CodeGenerator,
) {
  const object = generator.places.get(instruction.object.id);
  if (object === undefined) {
    throw new Error(`Place ${instruction.object.id} not found`);
  }
  t.assertExpression(object);

  const property = generator.places.get(instruction.property.id);
  if (property === undefined) {
    throw new Error(`Place ${instruction.property.id} not found`);
  }
  t.assertExpression(property);

  const node = t.memberExpression(object, property, true);
  generator.places.set(instruction.place.id, node);
  return node;
}
