import * as t from "@babel/types";
import {
  ExportDefaultDeclarationInstruction,
  ExportNamedDeclarationInstruction,
  ExportSpecifierInstruction,
  ImportDeclarationInstruction,
  ImportSpecifierInstruction,
  ModuleInstruction,
} from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateExportDefaultDeclarationInstruction } from "./generateExportDefaultDeclaration";
import { generateExportNamedDeclarationInstruction } from "./generateExportNamedDeclaration";
import { generateExportSpecifierInstruction } from "./generateExportSpecifier";
import { generateImportDeclarationInstruction } from "./generateImportDeclaration";
import { generateImportSpecifierInstruction } from "./generateImportSpecifier";

export function generateModuleInstruction(
  instruction: ModuleInstruction,
  generator: CodeGenerator,
):
  | t.Statement
  | t.ExportSpecifier
  | t.ImportSpecifier
  | t.ImportDefaultSpecifier
  | t.ImportNamespaceSpecifier {
  if (instruction instanceof ExportDefaultDeclarationInstruction) {
    return generateExportDefaultDeclarationInstruction(instruction, generator);
  } else if (instruction instanceof ExportNamedDeclarationInstruction) {
    return generateExportNamedDeclarationInstruction(instruction, generator);
  } else if (instruction instanceof ExportSpecifierInstruction) {
    return generateExportSpecifierInstruction(instruction, generator);
  } else if (instruction instanceof ImportDeclarationInstruction) {
    return generateImportDeclarationInstruction(instruction, generator);
  } else if (instruction instanceof ImportSpecifierInstruction) {
    return generateImportSpecifierInstruction(instruction, generator);
  }

  throw new Error(
    `Unsupported module instruction: ${instruction.constructor.name}`,
  );
}
