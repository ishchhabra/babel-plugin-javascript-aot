import * as t from "@babel/types";
import { BindingIdentifierInstruction } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
import { generateBlock } from "./generateBlock";
import { generateBindingIdentifierInstruction } from "./instructions/generateBindingIdentifier";
import { generateInstruction } from "./instructions/generateInstruction";

export function generateFunction(
  functionIR: FunctionIR,
  generator: CodeGenerator,
): {
  params: Array<t.Identifier | t.RestElement | t.Pattern>;
  statements: Array<t.Statement>;
} {
  // Save and restore generatedBlocks so each function gets a fresh scope.
  // This is necessary because function inlining can share FunctionIR
  // objects between the original definition and the inlined call site,
  // causing blocks to be incorrectly skipped on the second generation.
  const savedGeneratedBlocks = new Set(generator.generatedBlocks);

  // Pre-register all binding identifiers across ALL blocks of this function.
  // This ensures closures defined in earlier blocks can reference variables
  // declared in later blocks (e.g. phi variables in merge blocks).
  for (const [, block] of functionIR.blocks) {
    for (const instruction of block.instructions) {
      if (instruction instanceof BindingIdentifierInstruction) {
        generateBindingIdentifierInstruction(instruction, generator);
      }
    }
  }

  generateHeader(functionIR, generator);
  const params = generateFunctionParams(functionIR, generator);

  const entryBlock = functionIR.entryBlockId;
  const statements = generateBlock(entryBlock, functionIR, generator);

  generator.generatedBlocks = savedGeneratedBlocks;

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
