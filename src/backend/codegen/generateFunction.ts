import * as t from "@babel/types";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
import { generateBlock } from "./generateBlock";

export function generateFunction(
  functionIR: FunctionIR,
  generator: CodeGenerator,
): Array<t.Statement> {
  const entryBlock = functionIR.entryBlockId;
  const statements = generateBlock(entryBlock, functionIR, generator);
  return statements;
}
