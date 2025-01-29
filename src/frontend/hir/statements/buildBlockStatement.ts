import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { createBlock, JumpTerminal, makeInstructionId } from "../../../ir";
import { buildBindings } from "../bindings/buildBindings";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildBlockStatement(
  nodePath: NodePath<t.BlockStatement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const currentBlock = functionBuilder.currentBlock;

  const block = createBlock(functionBuilder.environment);
  functionBuilder.blocks.set(block.id, block);
  functionBuilder.currentBlock = block;

  buildBindings(nodePath, functionBuilder, environment);

  const body = nodePath.get("body");
  for (const statementPath of body) {
    buildNode(statementPath, functionBuilder, moduleBuilder, environment);
  }

  currentBlock.terminal = new JumpTerminal(
    makeInstructionId(functionBuilder.environment.nextInstructionId++),
    block.id,
  );
  return undefined;
}
