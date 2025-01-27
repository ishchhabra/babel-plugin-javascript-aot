import * as t from "@babel/types";
import { ExportNamedDeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateExportNamedDeclarationInstruction(instruction: ExportNamedDeclarationInstruction, generator: CodeGenerator): t.ExportNamedDeclaration;
