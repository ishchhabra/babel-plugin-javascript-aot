import * as t from "@babel/types";
import { ExportDefaultDeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateExportDefaultDeclarationInstruction(instruction: ExportDefaultDeclarationInstruction, generator: CodeGenerator): t.ExportDefaultDeclaration;
