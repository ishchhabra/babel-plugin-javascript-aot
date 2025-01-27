import * as t from "@babel/types";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
import { generateBlock } from "./generateBlock";
import { generateInstruction } from "./instructions/generateInstruction";

export function generateFunction(
  functionIR: FunctionIR,
  generator: CodeGenerator,
): { params: t.Identifier[]; statements: Array<t.Statement> } {
  generateHeader(functionIR, generator);
  const params = generateFunctionParams(functionIR, generator);

  const entryBlock = functionIR.entryBlockId;
  const statements = generateBlock(entryBlock, functionIR, generator);

  return { params, statements };
}

function generateFunctionParams(
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Identifier> {
  return functionIR.params.map((param) => {
    const node = generator.places.get(param.id)!;
    t.assertIdentifier(node);
    return node;
  });
}

function generateHeader(functionIR: FunctionIR, generator: CodeGenerator) {
  for (const instruction of functionIR.header) {
    generateInstruction(instruction, functionIR, generator);
  }
}
