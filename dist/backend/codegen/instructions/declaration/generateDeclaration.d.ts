import * as t from "@babel/types";
import { DeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateDeclarationInstruction(instruction: DeclarationInstruction, generator: CodeGenerator): t.FunctionDeclaration;
