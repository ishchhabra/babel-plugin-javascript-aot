import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { ImportDeclarationInstruction } from "../../../ir";
import { buildImportSpecifier } from "../buildImportSpecifier";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { resolveModulePath } from "../resolveModulePath";

export function buildImportDeclaration(
  nodePath: NodePath<t.ImportDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const sourcePath = nodePath.get("source");
  const sourceValue = sourcePath.node.value;
  const resolvedSourceValue = resolveModulePath(
    sourceValue,
    moduleBuilder.path,
  );

  const specifiersPath = nodePath.get("specifiers");
  const specifierPlaces = specifiersPath.map((specifierPath) => {
    const importSpecifierPlace = buildImportSpecifier(
      specifierPath as NodePath<
        | t.ImportSpecifier
        | t.ImportDefaultSpecifier
        | t.ImportNamespaceSpecifier
      >,
      nodePath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (
      importSpecifierPlace === undefined ||
      Array.isArray(importSpecifierPlace)
    ) {
      throw new Error(`Import specifier must be a single place`);
    }
    return importSpecifierPlace;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ImportDeclarationInstruction,
    place,
    nodePath,
    sourceValue,
    resolvedSourceValue,
    specifierPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
