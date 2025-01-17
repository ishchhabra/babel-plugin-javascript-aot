import * as t from "@babel/types";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
import { generateBasicBlock } from "./generateBlock";

export function generateFunction(
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  const entryBlock = functionIR.blocks.keys().next().value!;
  const statements = generateBasicBlock(entryBlock, functionIR, generator);
  return statements;
}
