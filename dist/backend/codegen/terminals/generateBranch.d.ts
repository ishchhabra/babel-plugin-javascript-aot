import * as t from "@babel/types";
import { BranchTerminal } from "../../../ir";
import { FunctionIR } from "../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateBranchTerminal(terminal: BranchTerminal, functionIR: FunctionIR, generator: CodeGenerator): Array<t.Statement>;
