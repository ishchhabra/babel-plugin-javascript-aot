import * as t from "@babel/types";
import { FunctionDeclarationInstruction } from "../../../../ir";
import { FunctionIR } from "../../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateFunctionDeclarationInstruction(instruction: FunctionDeclarationInstruction, functionIR: FunctionIR, generator: CodeGenerator): t.FunctionDeclaration;
