import * as t from "@babel/types";
import { ImportSpecifierInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateImportSpecifierInstruction(
  instruction: ImportSpecifierInstruction,
  generator: CodeGenerator,
): t.ImportSpecifier {
  const imported = generator.places.get(instruction.imported.id);
  if (imported === undefined) {
    throw new Error(`Place ${instruction.imported.id} not found`);
  }

  t.assertIdentifier(imported);

  // Handle case where local is undefined
  let local = imported;
  if (instruction.local) {
    const localNode = generator.places.get(instruction.local.id);
    if (localNode === undefined) {
      throw new Error(`Place ${instruction.local.id} not found`);
    }
    t.assertIdentifier(localNode);
    local = localNode;
  }

  const node = t.importSpecifier(imported, local);
  generator.places.set(instruction.place.id, node);
  return node;
}
