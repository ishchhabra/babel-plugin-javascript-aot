import * as t from "@babel/types";
import { FunctionDeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateFunctionDeclarationInstruction(instruction: FunctionDeclarationInstruction, generator: CodeGenerator): t.FunctionDeclaration;
