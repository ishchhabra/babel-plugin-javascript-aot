import * as t from "@babel/types";
import { ImportDeclarationInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateImportDeclarationInstruction(
  instruction: ImportDeclarationInstruction,
  generator: CodeGenerator,
): t.Statement {
  const source = t.valueToNode(instruction.source);
  const specifiers = instruction.specifiers.map((specifier) => {
    const node = generator.places.get(specifier.id);
    if (node === undefined) {
      throw new Error(`Place ${specifier.id} not found`);
    }

    t.assertImportSpecifier(node);
    return node;
  });

  return t.importDeclaration(specifiers, source);
}
