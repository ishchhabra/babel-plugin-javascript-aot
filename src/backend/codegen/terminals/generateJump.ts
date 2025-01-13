import * as t from "@babel/types";
import { JumpTerminal } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
import { generateBlock } from "../generateBlock";

export function generateJumpTerminal(
  terminal: JumpTerminal,
  generator: CodeGenerator,
): Array<t.Statement> {
  return generateBlock(terminal.target, generator);
}
