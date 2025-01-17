import { BranchTerminal } from "../../ir";

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
  if (!(terminal instanceof BranchTerminal)) {
    throw new Error(
      `Unsupported back edge from ${blockId} to ${blockId} (${terminal.constructor.name})`,
    );
  }

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
  // NOTE: No need to generate the consequent block, because in a while loop
  // it's the same as the fallthrough block.
  const exitInstructions = generateBasicBlock(
    terminal.fallthrough,
    functionIR,
    generator,
  );

  const node = t.whileStatement(test, t.blockStatement(bodyInstructions));
  return [node, ...exitInstructions];
}
