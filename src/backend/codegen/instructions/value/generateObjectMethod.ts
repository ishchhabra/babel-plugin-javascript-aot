import * as t from "@babel/types";
import { ObjectMethodInstruction } from "../../../../ir";
import { FunctionIR } from "../../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateBlock } from "../../generateBlock";

export function generateObjectMethodInstruction(
  instruction: ObjectMethodInstruction,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): t.ObjectMethod {
  const key = generator.places.get(instruction.key.id);
  if (key === undefined) {
    throw new Error(`Place ${instruction.key.id} not found`);
  }

  t.assertExpression(key);

  const params = instruction.params.map((param) => {
    // Since this is the first time we're using param, it does not exist in the
    // places map. We need to create a new identifier for it.
    const identifier = t.identifier(param.identifier.name);
    generator.places.set(param.id, identifier);
    return identifier;
  });

  const body = generateBlock(instruction.body, functionIR, generator);
  const node = t.objectMethod(
    instruction.kind,
    key,
    params,
    t.blockStatement(body),
    instruction.computed,
    instruction.generator,
    instruction.async,
  );

  generator.places.set(instruction.place.id, node);
  return node;
}
