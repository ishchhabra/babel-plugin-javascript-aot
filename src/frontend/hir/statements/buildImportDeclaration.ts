import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { createRequire } from "module";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  ImportDeclarationInstruction,
} from "../../../ir";
import { buildImportSpecifier } from "../buildImportSpecifier";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildImportDeclaration(
  nodePath: NodePath<t.ImportDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const sourcePath = nodePath.get("source");
  const sourceValue = sourcePath.node.value;
  const resolvedSourceValue = resolveModulePath(
    sourceValue,
    moduleBuilder.path,
  );

  const specifiersPath = nodePath.get("specifiers");
  const specifierPlaces = specifiersPath.map((specifierPath) => {
    if (specifierPath.isImportNamespaceSpecifier()) {
      throw new Error("Import namespace specifier is not supported");
    }

    const importSpecifierPlace = buildImportSpecifier(
      specifierPath as NodePath<t.ImportSpecifier | t.ImportDefaultSpecifier>,
      nodePath,
      functionBuilder,
      moduleBuilder,
    );
    if (
      importSpecifierPlace === undefined ||
      Array.isArray(importSpecifierPlace)
    ) {
      throw new Error(`Import specifier must be a single place`);
    }
    return importSpecifierPlace;
  });

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instruction = new ImportDeclarationInstruction(
    createInstructionId(functionBuilder.environment),
    place,
    nodePath,
    sourceValue,
    resolvedSourceValue,
    specifierPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}

function resolveModulePath(importPath: string, path: string): string {
  const require = createRequire(path);
  return require.resolve(importPath);
}
