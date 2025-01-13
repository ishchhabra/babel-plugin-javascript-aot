import * as t from "@babel/types";
import { MemberExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateMemberExpression(
  instruction: MemberExpressionInstruction,
  generator: CodeGenerator,
): t.Expression {
  const object = generator.places.get(instruction.object.id);
  if (object === undefined) {
    throw new Error(`Place ${instruction.object.id} not found`);
  }

  const property = generator.places.get(instruction.property.id);
  if (property === undefined) {
    throw new Error(`Place ${instruction.property.id} not found`);
  }

  t.assertExpression(object);
  t.assertExpression(property);

  const node = t.memberExpression(object, property);
  generator.places.set(instruction.place.id, node);
  return node;
}
