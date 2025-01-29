import * as t from "@babel/types";
import { ModuleInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateModuleInstruction(instruction: ModuleInstruction, generator: CodeGenerator): t.Statement | t.ExportSpecifier | t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier;
