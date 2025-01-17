import * as t from "@babel/types";
import { FunctionDeclarationInstruction } from "../../../../ir";
import { FunctionIR } from "../../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateBlock } from "../../generateBlock";

export function generateFunctionDeclarationInstruction(
  instruction: FunctionDeclarationInstruction,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): t.FunctionDeclaration {
  // Since this is the first time we're using param, it does not exist in the
  // places map. We need to create a new identifier for it.
  const paramNodes = instruction.params.map((param) => {
    const identifier = t.identifier(param.identifier.name);
    generator.places.set(param.id, identifier);
    return identifier;
  });

  // Since this is the first time we're using the function name, it does not
  // exist in the places map. We need to create a new identifier for it.
  const idNode = t.identifier(instruction.place.identifier.name);
  generator.places.set(instruction.place.id, idNode);

  const body = generateBlock(instruction.body, functionIR, generator);
  const node = t.functionDeclaration(
    idNode,
    paramNodes,
    t.blockStatement(body),
    instruction.generator,
    instruction.async,
  );
  return node;
}
