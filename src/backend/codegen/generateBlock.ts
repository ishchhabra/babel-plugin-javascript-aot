import * as t from "@babel/types";
import { BlockId } from "../../ir";
import { CodeGenerator } from "../CodeGenerator";
import { generateBackEdge } from "./generateBackEdge";
import { generateInstruction } from "./instructions/generateInstruction";
import { generateTerminal } from "./terminals/generateTerminal";

export function generateBlock(
  blockId: BlockId,
  generator: CodeGenerator,
): Array<t.Statement> {
  if (generator.generatedBlocks.has(blockId)) {
    return [];
  }

  generator.generatedBlocks.add(blockId);

  const block = generator.blocks.get(blockId);
  if (block === undefined) {
    throw new Error(`Block ${blockId} not found`);
  }

  const statements = generateBasicBlock(blockId, generator);
  generator.blockToStatements.set(blockId, statements);
  return statements;
}

export function generateBasicBlock(
  blockId: BlockId,
  generator: CodeGenerator,
): Array<t.Statement> {
  const block = generator.blocks.get(blockId);
  if (block === undefined) {
    throw new Error(`Block ${blockId} not found`);
  }

  const statements: Array<t.Statement> = [];
  for (const instruction of block.instructions) {
    statements.push(...generateInstruction(instruction, generator));
  }

  const backEdges = generator.backEdges.get(blockId)!;
  if (backEdges.size > 1) {
    throw new Error(`Block ${blockId} has multiple back edges`);
  }

  if (backEdges.size > 0) {
    return generateBackEdge(blockId, generator);
  }

  const terminal = block.terminal;
  if (terminal !== undefined) {
    statements.push(...generateTerminal(terminal, generator));
  }

  generator.blockToStatements.set(blockId, statements);
  return statements;
}
