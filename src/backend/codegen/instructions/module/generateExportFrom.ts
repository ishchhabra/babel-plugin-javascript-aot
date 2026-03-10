import * as t from "@babel/types";
import { ExportFromInstruction } from "../../../../ir/instructions/module/ExportFrom";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateExportFromInstruction(
  instruction: ExportFromInstruction,
  generator: CodeGenerator,
): t.ExportNamedDeclaration {
  const specifiers = instruction.specifiers.map((s) => {
    const local = t.identifier(s.local);
    const exported = t.identifier(s.exported);
    return t.exportSpecifier(local, exported);
  });

  const source = t.stringLiteral(instruction.source);
  const node = t.exportNamedDeclaration(null, specifiers, source);
  generator.places.set(instruction.place.id, node);
  return node;
}
