import * as t from "@babel/types";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
import { generateBlock } from "./generateBlock";
import { generateInstruction } from "./instructions/generateInstruction";

export function generateFunction(
  functionIR: FunctionIR,
  generator: CodeGenerator,
): {
  params: Array<t.Identifier | t.RestElement | t.Pattern>;
  statements: Array<t.Statement>;
} {
  generateHeader(functionIR, generator);
  const params = generateFunctionParams(functionIR, generator);

  const entryBlock = functionIR.entryBlockId;
  const statements = generateBlock(entryBlock, functionIR, generator);

  return { params, statements };
}

function generateFunctionParams(
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Identifier | t.RestElement | t.Pattern> {
  return functionIR.params.map((param) => {
    const node = generator.places.get(param.id);
    if (node === undefined) {
      throw new Error(`Place ${param.id} not found`);
    }

    if (node === null) {
      throw new Error(`Holes are not supported in function parameters.`);
    }

    if (!(t.isIdentifier(node) || t.isPattern(node) || t.isRestElement(node))) {
      throw new Error(`Unsupported function param: ${node.type}`);
    }
    return node;
  });
}

function generateHeader(functionIR: FunctionIR, generator: CodeGenerator) {
  for (const instruction of functionIR.header) {
    generateInstruction(instruction, functionIR, generator);
  }
}
