import * as t from "@babel/types";
import { ExportSpecifierInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateExportSpecifierInstruction(instruction: ExportSpecifierInstruction, generator: CodeGenerator): t.ExportSpecifier;
