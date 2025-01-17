import * as t from "@babel/types";
import {
  DeclarationInstruction,
  FunctionDeclarationInstruction,
} from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateFunctionDeclarationInstruction } from "./generateFunctionDeclaration";

export function generateDeclarationInstruction(
  instruction: DeclarationInstruction,
  generator: CodeGenerator,
): t.FunctionDeclaration {
  if (instruction instanceof FunctionDeclarationInstruction) {
    return generateFunctionDeclarationInstruction(instruction, generator);
  }

  throw new Error(
    `Unsupported declaration type: ${instruction.constructor.name}`,
  );
}
