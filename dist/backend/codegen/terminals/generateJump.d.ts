import * as t from "@babel/types";
import { JumpTerminal } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateJumpTerminal(terminal: JumpTerminal, generator: CodeGenerator): Array<t.Statement>;
