import * as t from "@babel/types";
import { ImportSpecifierInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateImportSpecifierInstruction(instruction: ImportSpecifierInstruction, generator: CodeGenerator): t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier;
