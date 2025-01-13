import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  BranchTerminal,
  createBlock,
  JumpTerminal,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildWhileStatement(
  nodePath: NodePath<t.WhileStatement>,
  builder: HIRBuilder,
) {
  const currentBlock = builder.currentBlock;

  // Build the test block.
  const testPath = nodePath.get("test");
  const testBlock = createBlock(builder.environment);
  builder.blocks.set(testBlock.id, testBlock);

  builder.currentBlock = testBlock;
  const testPlace = buildNode(testPath, builder);
  if (testPlace === undefined || Array.isArray(testPlace)) {
    throw new Error("While statement test must be a single place");
  }
  const testBlockTerminus = builder.currentBlock;

  // Build the body block.
  const bodyPath = nodePath.get("body");
  const bodyBlock = createBlock(builder.environment);
  builder.blocks.set(bodyBlock.id, bodyBlock);

  builder.currentBlock = bodyBlock;
  buildNode(bodyPath, builder);
  const bodyBlockTerminus = builder.currentBlock;

  // Build the exit block.
  const exitBlock = createBlock(builder.environment);
  builder.blocks.set(exitBlock.id, exitBlock);

  // Set the branch terminal for the test block.
  testBlockTerminus.terminal = new BranchTerminal(
    makeInstructionId(builder.environment.nextInstructionId++),
    testPlace,
    bodyBlock.id,
    exitBlock.id,
    exitBlock.id,
  );

  // Set the jump terminal for body block to create a back edge.
  bodyBlockTerminus.terminal = new JumpTerminal(
    makeInstructionId(builder.environment.nextInstructionId++),
    testBlock.id,
  );

  // Set the jump terminal for the current block.
  currentBlock.terminal = new JumpTerminal(
    makeInstructionId(builder.environment.nextInstructionId++),
    testBlock.id,
  );

  builder.currentBlock = exitBlock;
  return undefined;
}
