import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import {
  BasicBlock,
  BranchTerminal,
  createBlock,
  createInstructionId,
  JumpTerminal,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildIfStatement(
  nodePath: NodePath<t.IfStatement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const testPath = nodePath.get("test");
  const testPlace = buildNode(
    testPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (testPlace === undefined || Array.isArray(testPlace)) {
    throw new Error("If statement test must be a single place");
  }

  const currentBlock = functionBuilder.currentBlock;

  // Create the join block.
  const joinBlock = createBlock(functionBuilder.environment);
  functionBuilder.blocks.set(joinBlock.id, joinBlock);

  // Build the consequent block
  const consequentPath = nodePath.get("consequent");
  const consequentBlock = createBlock(functionBuilder.environment);
  functionBuilder.blocks.set(consequentBlock.id, consequentBlock);

  functionBuilder.currentBlock = consequentBlock;
  buildNode(consequentPath, functionBuilder, moduleBuilder, environment);

  // After building the consequent block, we need to set the terminal
  // from the last block to the join block.
  functionBuilder.currentBlock.terminal = new JumpTerminal(
    createInstructionId(functionBuilder.environment),
    joinBlock.id,
  );

  // Build the alternate block
  const alternatePath = nodePath.get("alternate");
  let alternateBlock: BasicBlock | undefined = currentBlock;
  if (alternatePath.hasNode()) {
    alternateBlock = createBlock(functionBuilder.environment);
    functionBuilder.blocks.set(alternateBlock.id, alternateBlock);

    functionBuilder.currentBlock = alternateBlock;
    buildNode(alternatePath, functionBuilder, moduleBuilder, environment);
  }

  // After building the alternate block, we need to set the terminal
  // from the last block to the join block.
  functionBuilder.currentBlock.terminal = new JumpTerminal(
    createInstructionId(functionBuilder.environment),
    joinBlock.id,
  );

  // Set branch terminal for the current block.
  currentBlock.terminal = new BranchTerminal(
    createInstructionId(functionBuilder.environment),
    testPlace,
    consequentBlock.id,
    alternateBlock.id,
    joinBlock.id,
  );

  functionBuilder.currentBlock = joinBlock;
  return undefined;
}
