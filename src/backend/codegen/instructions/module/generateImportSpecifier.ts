import * as t from "@babel/types";
import { toIdentifierOrStringLiteral } from "../../../../babel-utils";
import { ImportSpecifierInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateImportSpecifierInstruction(
  instruction: ImportSpecifierInstruction,
  generator: CodeGenerator,
): t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier {
  if (instruction.imported === "default") {
    return generateImportDefaultSpecifier(instruction, generator);
  } else if (instruction.imported === "*") {
    return generateImportNamespaceSpecifier(instruction, generator);
  } else {
    return generateImportSpecifier(instruction, generator);
  }
}

function generateImportDefaultSpecifier(
  instruction: ImportSpecifierInstruction,
  generator: CodeGenerator,
) {
  const local = t.identifier(instruction.local);
  const node = t.importDefaultSpecifier(local);
  generator.places.set(instruction.place.id, node);
  return node;
}

function generateImportNamespaceSpecifier(
  instruction: ImportSpecifierInstruction,
  generator: CodeGenerator,
) {
  const local = t.identifier(instruction.local);
  const node = t.importNamespaceSpecifier(local);
  generator.places.set(instruction.place.id, node);
  return node;
}

function generateImportSpecifier(
  instruction: ImportSpecifierInstruction,
  generator: CodeGenerator,
) {
  const local = t.identifier(instruction.local);
  const imported = toIdentifierOrStringLiteral(instruction.imported);
  const node = t.importSpecifier(local, imported);
  generator.places.set(instruction.place.id, node);
  return node;
}
