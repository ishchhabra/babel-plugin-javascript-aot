import * as t from "@babel/types";
import { toIdentifierOrStringLiteral } from "../../../../babel-utils";
import { ExportSpecifierInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateExportSpecifierInstruction(
  instruction: ExportSpecifierInstruction,
  generator: CodeGenerator,
): t.ExportSpecifier {
  const local = t.identifier(instruction.local);
  const exported = toIdentifierOrStringLiteral(instruction.exported);

  const node = t.exportSpecifier(local, exported);
  generator.places.set(instruction.place.id, node);
  return node;
}
