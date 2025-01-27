import * as t from "@babel/types";
import { ObjectMethodInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateFunction } from "../../generateFunction";

export function generateObjectMethodInstruction(
  instruction: ObjectMethodInstruction,
  generator: CodeGenerator,
): t.ObjectMethod {
  const key = generator.places.get(instruction.key.id);
  if (key === undefined) {
    throw new Error(`Place ${instruction.key.id} not found`);
  }

  t.assertExpression(key);

  const { params, statements } = generateFunction(instruction.body, generator);
  const node = t.objectMethod(
    instruction.kind,
    key,
    params,
    t.blockStatement(statements),
    instruction.computed,
    instruction.generator,
    instruction.async,
  );

  generator.places.set(instruction.place.id, node);
  return node;
}
