import * as t from "@babel/types";
import { LoadStaticPropertyInstruction } from "../../../../ir/instructions/memory/LoadStaticProperty";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateLoadStaticPropertyInstruction(
  instruction: LoadStaticPropertyInstruction,
  generator: CodeGenerator,
) {
  const object = generator.places.get(instruction.object.id);
  if (object === undefined) {
    throw new Error(`Place ${instruction.object.id} not found`);
  }
  t.assertExpression(object);

  let node: t.Expression;
  if (isNumeric(instruction.property)) {
    const property = t.numericLiteral(Number(instruction.property));
    node = t.memberExpression(object, property, true);
  } else if (t.isValidIdentifier(instruction.property, true)) {
    const property = t.identifier(instruction.property);
    node = t.memberExpression(object, property);
  } else {
    const property = t.valueToNode(instruction.property);
    node = t.memberExpression(object, property, true);
  }

  generator.places.set(instruction.place.id, node);
  return node;
}

function isNumeric(value: string) {
  return /^-?\d+$/.test(value);
}
