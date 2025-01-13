import * as t from "@babel/types";
import {
  BaseTerminal,
  BranchTerminal,
  JumpTerminal,
  ReturnTerminal,
} from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
import { generateBranchTerminal } from "./generateBranch";
import { generateJumpTerminal } from "./generateJump";
import { generateReturnTerminal } from "./generateReturn";

export function generateTerminal(
  terminal: BaseTerminal,
  generator: CodeGenerator,
): Array<t.Statement> {
  if (terminal instanceof BranchTerminal) {
    return generateBranchTerminal(terminal, generator);
  } else if (terminal instanceof JumpTerminal) {
    return generateJumpTerminal(terminal, generator);
  } else if (terminal instanceof ReturnTerminal) {
    return generateReturnTerminal(terminal, generator);
  }

  throw new Error(`Unsupported terminal type: ${terminal.constructor.name}`);
}
