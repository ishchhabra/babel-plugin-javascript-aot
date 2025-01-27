import * as t from "@babel/types";
import { FunctionDeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateFunction } from "../../generateFunction";

export function generateFunctionDeclarationInstruction(
  instruction: FunctionDeclarationInstruction,
  generator: CodeGenerator,
): t.FunctionDeclaration {
  const idNode = generator.places.get(instruction.place.id)!;
  t.assertIdentifier(idNode);

  const { params, statements } = generateFunction(
    instruction.functionIR,
    generator,
  );
  const node = t.functionDeclaration(
    idNode,
    params,
    t.blockStatement(statements),
    instruction.generator,
    instruction.async,
  );
  generator.places.set(instruction.place.id, node);
  return node;
}
