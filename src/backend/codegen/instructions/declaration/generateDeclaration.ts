import * as t from "@babel/types";
import {
  DeclarationInstruction,
  FunctionDeclarationInstruction,
} from "../../../../ir";
import { FunctionIR } from "../../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateFunctionDeclarationInstruction } from "./generateFunctionDeclaration";

export function generateDeclarationInstruction(
  instruction: DeclarationInstruction,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): t.FunctionDeclaration {
  if (instruction instanceof FunctionDeclarationInstruction) {
    return generateFunctionDeclarationInstruction(
      instruction,
      functionIR,
      generator,
    );
  }

  throw new Error(
    `Unsupported declaration type: ${instruction.constructor.name}`,
  );
}
