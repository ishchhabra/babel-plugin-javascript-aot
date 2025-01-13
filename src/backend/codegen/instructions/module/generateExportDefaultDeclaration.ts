import * as t from "@babel/types";
import { ExportDefaultDeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateExportDefaultDeclarationInstruction(
  instruction: ExportDefaultDeclarationInstruction,
  generator: CodeGenerator,
): t.ExportDefaultDeclaration {
  const declaration = generator.places.get(instruction.declaration.id);
  if (declaration === undefined) {
    throw new Error(`Place ${instruction.declaration.id} not found`);
  }

  if (
    !t.isFunctionDeclaration(declaration) &&
    !t.isClassDeclaration(declaration) &&
    !t.isExpression(declaration)
  ) {
    throw new Error(
      `Unsupported export default declaration type: ${declaration?.type}`,
    );
  }

  return t.exportDefaultDeclaration(declaration);
}
