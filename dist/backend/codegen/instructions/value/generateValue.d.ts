import * as t from "@babel/types";
import { ValueInstruction } from "../../../../ir";
import { FunctionIR } from "../../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateValueInstruction(instruction: ValueInstruction, functionIR: FunctionIR, generator: CodeGenerator): t.Expression | t.ObjectMethod | t.ObjectProperty | null;
