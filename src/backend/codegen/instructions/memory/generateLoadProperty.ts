import * as t from "@babel/types";
import { LoadPropertyInstruction } from "../../../../ir/instructions/memory/LoadProperty";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateLoadPropertyInstruction(
  instruction: LoadPropertyInstruction,
  generator: CodeGenerator,
) {
  const object = generator.places.get(instruction.object.id);
  if (object === undefined) {
    throw new Error(`Place ${instruction.object.id} not found`);
  }
  t.assertExpression(object);

  if (t.isValidIdentifier(instruction.property, true)) {
    const property = t.identifier(instruction.property);
    const node = t.memberExpression(object, property);
    generator.places.set(instruction.place.id, node);
    return node;
  }

  const property = t.valueToNode(instruction.property);
  const node = t.memberExpression(object, property, true);
  generator.places.set(instruction.place.id, node);
  return node;
}
