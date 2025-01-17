import * as t from "@babel/types";
import { BranchTerminal } from "../../../ir";
import { FunctionIR } from "../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../CodeGenerator";
import { generateBlock } from "../generateBlock";

export function generateBranchTerminal(
  terminal: BranchTerminal,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  // Generate the fallthrough block first so that we do not rebuild it
  // if the alternate block is the same as the fallthrough block.
  const fallthrough = generateBlock(
    terminal.fallthrough,
    functionIR,
    generator,
  );

  const test = generator.places.get(terminal.test.id);
  if (test === undefined) {
    throw new Error(`Place ${terminal.test.id} not found`);
  }

  t.assertExpression(test);

  const consequent = generateBlock(terminal.consequent, functionIR, generator);
  let alternate;
  if (terminal.alternate !== terminal.fallthrough) {
    alternate = generateBlock(terminal.alternate, functionIR, generator);
  }

  const node = t.ifStatement(
    test,
    t.blockStatement(consequent),
    alternate ? t.blockStatement(alternate) : null,
  );

  const statements = [node, ...fallthrough];
  return statements;
}
