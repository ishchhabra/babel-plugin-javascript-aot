import * as t from "@babel/types";
import { ExportNamedDeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateExportNamedDeclarationInstruction(
  instruction: ExportNamedDeclarationInstruction,
  generator: CodeGenerator,
): t.ExportNamedDeclaration {
  if (instruction.declaration !== undefined) {
    const declaration = generator.places.get(instruction.declaration.id);
    if (declaration === undefined) {
      throw new Error(`Place ${instruction.declaration.id} not found`);
    }

    t.assertDeclaration(declaration);
    const node = t.exportNamedDeclaration(declaration, []);
    generator.places.set(instruction.place.id, node);
    return node;
  }

  const specifiers = instruction.specifiers.map((specifier) => {
    const node = generator.places.get(specifier.id);
    if (node === undefined) {
      throw new Error(`Place ${specifier.id} not found`);
    }

    t.assertExportSpecifier(node);
    return node;
  });

  const node = t.exportNamedDeclaration(null, specifiers);
  generator.places.set(instruction.place.id, node);
  return node;
}
