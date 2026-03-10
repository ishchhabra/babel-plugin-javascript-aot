import { BranchTerminal, JumpTerminal } from "../../ir";

import * as t from "@babel/types";
import { BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
import { generateBasicBlock } from "./generateBlock";

export function generateBackEdge(
  blockId: BlockId,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  const terminal = functionIR.blocks.get(blockId)!.terminal!;

  if (terminal instanceof JumpTerminal) {
    return generateJumpBackEdge(terminal, functionIR, generator);
  }

  if (terminal instanceof BranchTerminal) {
    return generateBranchBackEdge(terminal, functionIR, generator);
  }

  throw new Error(
    `Unsupported back edge on block ${blockId} (${terminal.constructor.name})`,
  );
}

/**
 * A JumpTerminal back edge is an unconditional loop: while (true) { ... }
 *
 * This occurs when ConstantPropagationPass folds a loop condition that is
 * always true, replacing BranchTerminal(true, body, exit) with
 * JumpTerminal(body).
 */
function generateJumpBackEdge(
  terminal: JumpTerminal,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  const bodyInstructions = generateBasicBlock(
    terminal.target,
    functionIR,
    generator,
  );

  const node = t.whileStatement(
    t.booleanLiteral(true),
    t.blockStatement(bodyInstructions),
  );
  return [node];
}

function generateBranchBackEdge(
  terminal: BranchTerminal,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  const test = generator.places.get(terminal.test.id);
  if (test === undefined) {
    throw new Error(`Place ${terminal.test.id} not found`);
  }

  t.assertExpression(test);

  const bodyInstructions = generateBasicBlock(
    terminal.consequent,
    functionIR,
    generator,
  );
  const exitInstructions = generateBasicBlock(
    terminal.fallthrough,
    functionIR,
    generator,
  );

  const node = t.whileStatement(test, t.blockStatement(bodyInstructions));
  return [node, ...exitInstructions];
}
