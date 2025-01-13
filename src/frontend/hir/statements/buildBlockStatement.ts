import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { createBlock, JumpTerminal, makeInstructionId } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildBindings } from "../bindings/buildBindings";
import { buildNode } from "../buildNode";

export function buildBlockStatement(
  nodePath: NodePath<t.BlockStatement>,
  builder: HIRBuilder,
) {
  const currentBlock = builder.currentBlock;

  const block = createBlock(builder.environment);
  builder.blocks.set(block.id, block);
  builder.currentBlock = block;

  buildBindings(nodePath, builder);

  const body = nodePath.get("body");
  for (const statementPath of body) {
    buildNode(statementPath, builder);
  }

  currentBlock.terminal = new JumpTerminal(
    makeInstructionId(builder.environment.nextInstructionId++),
    block.id,
  );
  return undefined;
}
