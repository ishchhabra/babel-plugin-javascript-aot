import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { createRequire } from "module";
import {
  createIdentifier,
  createPlace,
  ImportDeclarationInstruction,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildImportDeclaration(
  nodePath: NodePath<t.ImportDeclaration>,
  builder: HIRBuilder,
) {
  const sourcePath = nodePath.get("source");
  const sourceValue = sourcePath.node.value;
  const resolvedSourceValue = resolveModulePath(sourceValue, builder.path);

  const specifiersPath = nodePath.get("specifiers");
  const specifierPlaces = specifiersPath.map((specifierPath) => {
    const importSpecifierPlace = buildNode(specifierPath, builder);
    if (
      importSpecifierPlace === undefined ||
      Array.isArray(importSpecifierPlace)
    ) {
      throw new Error(`Import specifier must be a single place`);
    }
    return importSpecifierPlace;
  });

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  builder.currentBlock.instructions.push(
    new ImportDeclarationInstruction(
      makeInstructionId(builder.environment.nextInstructionId++),
      place,
      nodePath,
      sourceValue,
      resolvedSourceValue,
      specifierPlaces,
    ),
  );

  builder.importToPlaces.set(resolvedSourceValue, place);
  return place;
}

function resolveModulePath(importPath: string, path: string): string {
  const require = createRequire(path);
  return require.resolve(importPath);
}
