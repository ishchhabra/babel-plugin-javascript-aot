import * as t from "@babel/types";
import { BaseInstruction } from "../../../ir";
import { FunctionIR } from "../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateInstruction(instruction: BaseInstruction, functionIR: FunctionIR, generator: CodeGenerator): Array<t.Statement>;
