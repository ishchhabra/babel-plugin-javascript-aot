import * as t from "@babel/types";
import { BaseTerminal } from "../../../ir";
import { FunctionIR } from "../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateTerminal(terminal: BaseTerminal, functionIR: FunctionIR, generator: CodeGenerator): Array<t.Statement>;
