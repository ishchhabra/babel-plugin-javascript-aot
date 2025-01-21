import * as t from "@babel/types";
import { ImportDeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateImportDeclarationInstruction(instruction: ImportDeclarationInstruction, generator: CodeGenerator): t.Statement;
