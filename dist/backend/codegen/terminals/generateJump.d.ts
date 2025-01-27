import * as t from "@babel/types";
import { JumpTerminal } from "../../../ir";
import { FunctionIR } from "../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateJumpTerminal(terminal: JumpTerminal, functionIR: FunctionIR, generator: CodeGenerator): Array<t.Statement>;
