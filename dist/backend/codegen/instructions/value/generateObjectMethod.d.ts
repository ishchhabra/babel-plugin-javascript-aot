import * as t from "@babel/types";
import { ObjectMethodInstruction } from "../../../../ir";
import { FunctionIR } from "../../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateObjectMethodInstruction(instruction: ObjectMethodInstruction, functionIR: FunctionIR, generator: CodeGenerator): t.ObjectMethod;
