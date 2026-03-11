import * as t from "@babel/types";
import { BindingIdentifierInstruction, BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
import { generateBackEdge } from "./generateBackEdge";
import { generateBindingIdentifierInstruction } from "./instructions/generateBindingIdentifier";
import { generateInstruction } from "./instructions/generateInstruction";
import { generateTerminal } from "./terminals/generateTerminal";

export function generateBlock(
  blockId: BlockId,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  if (generator.generatedBlocks.has(blockId)) {
    return [];
  }

  generator.generatedBlocks.add(blockId);

  const block = functionIR.blocks.get(blockId);
  if (block === undefined) {
    throw new Error(`Block ${blockId} not found`);
  }

  const statements = generateBasicBlock(blockId, functionIR, generator);
  generator.blockToStatements.set(blockId, statements);
  return statements;
}

export function generateBasicBlock(
  blockId: BlockId,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  const block = functionIR.blocks.get(blockId);
  if (block === undefined) {
    throw new Error(`Block ${blockId} not found`);
  }

  // Pre-register all binding identifiers before generating instructions.
  // This mirrors how JS engines handle hoisting: bindings are created at
  // scope entry before any code executes. Without this, forward references
  // to hoisted function declarations and closure references from nested
  // function bodies would fail to resolve.
  for (const instruction of block.instructions) {
    if (instruction instanceof BindingIdentifierInstruction) {
      generateBindingIdentifierInstruction(instruction, generator);
    }
  }

  const statements: Array<t.Statement> = [];
  for (const instruction of block.instructions) {
    statements.push(...generateInstruction(instruction, functionIR, generator));
  }

  const backEdges = functionIR.backEdges.get(blockId)!;
  if (backEdges.size > 1) {
    throw new Error(`Block ${blockId} has multiple back edges`);
  }

  if (backEdges.size > 0) {
    return generateBackEdge(blockId, functionIR, generator);
  }

  const terminal = block.terminal;
  if (terminal !== undefined) {
    statements.push(...generateTerminal(terminal, functionIR, generator));
  }

  generator.blockToStatements.set(blockId, statements);
  return statements;
}
