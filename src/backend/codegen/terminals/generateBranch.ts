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
  // Reserve the fallthrough block so branches don't pull it into their scope,
  // but defer its generation until after the branches have populated phi places.
  generator.generatedBlocks.add(terminal.fallthrough);

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

  // Now generate fallthrough — branches have defined all phi operands.
  generator.generatedBlocks.delete(terminal.fallthrough);
  const fallthrough = generateBlock(
    terminal.fallthrough,
    functionIR,
    generator,
  );

  const node = t.ifStatement(
    test,
    t.blockStatement(consequent),
    alternate ? t.blockStatement(alternate) : null,
  );

  const statements = [node, ...fallthrough];
  return statements;
}
