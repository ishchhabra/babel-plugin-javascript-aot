import * as t from "@babel/types";
import { DeclarationInstruction } from "../../../../ir";
import { FunctionIR } from "../../../../ir/core/FunctionIR";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateDeclarationInstruction(instruction: DeclarationInstruction, functionIR: FunctionIR, generator: CodeGenerator): t.FunctionDeclaration;
