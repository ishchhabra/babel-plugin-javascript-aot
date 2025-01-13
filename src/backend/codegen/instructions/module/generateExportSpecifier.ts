import { isKeyword } from "@babel/helper-validator-identifier";
import * as t from "@babel/types";
import { ExportSpecifierInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateExportSpecifierInstruction(
  instruction: ExportSpecifierInstruction,
  generator: CodeGenerator,
): t.ExportSpecifier {
  const local = generator.places.get(instruction.local.id);
  if (local === undefined) {
    throw new Error(`Place ${instruction.local.id} not found`);
  }

  t.assertIdentifier(local);

  const exported =
    t.isValidIdentifier(instruction.exported) || isKeyword(instruction.exported)
      ? t.identifier(instruction.exported)
      : t.stringLiteral(instruction.exported);

  const node = t.exportSpecifier(local, exported);
  generator.places.set(instruction.place.id, node);
  return node;
}
