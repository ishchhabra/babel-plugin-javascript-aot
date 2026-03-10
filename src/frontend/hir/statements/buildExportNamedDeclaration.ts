import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { ExportNamedDeclarationInstruction } from "../../../ir";
import { ExportFromInstruction } from "../../../ir/instructions/module/ExportFrom";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { resolveModulePath } from "../resolveModulePath";

export function buildExportNamedDeclaration(
  nodePath: NodePath<t.ExportNamedDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  // Re-exports: export { x, y } from './mod'
  if (nodePath.node.source) {
    return buildExportFrom(
      nodePath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }

  const declarationPath = nodePath.get("declaration");
  const specifiersPath = nodePath.get("specifiers");

  // An export can have either declaration or specifiers, but not both.
  if (declarationPath.hasNode()) {
    let declarationPlace = buildNode(
      declarationPath,
      functionBuilder,
      moduleBuilder,
      environment,
    )!;
    if (Array.isArray(declarationPlace)) {
      // TODO: Iterate over all declaration places to split them into multiple instructions.
      // Example:
      //   export const a = 1, b = 2;
      //   =>
      //   export const a = 1;
      //   export const b = 2;
      declarationPlace = declarationPlace[0];
    }

    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(
      ExportNamedDeclarationInstruction,
      place,
      nodePath,
      [],
      declarationPlace,
    );
    functionBuilder.addInstruction(instruction);
    const declarationInstructionId = environment.getDeclarationInstruction(
      declarationPlace.identifier.declarationId,
    )!;
    moduleBuilder.exports.set(identifier.name, {
      instruction,
      declaration: environment.instructions.get(declarationInstructionId)!,
    });
    return place;
  } else {
    const exportSpecifierPlaces = specifiersPath.map((specifierPath) => {
      const exportSpecifierPlace = buildNode(
        specifierPath,
        functionBuilder,
        moduleBuilder,
        environment,
      );
      if (
        exportSpecifierPlace === undefined ||
        Array.isArray(exportSpecifierPlace)
      ) {
        throw new Error(`Export specifier must be a single place`);
      }
      return exportSpecifierPlace;
    });

    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instruction = environment.createInstruction(
      ExportNamedDeclarationInstruction,
      place,
      nodePath,
      exportSpecifierPlaces,
      undefined,
    );
    functionBuilder.addInstruction(instruction);
    return place;
  }
}

function buildExportFrom(
  nodePath: NodePath<t.ExportNamedDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const source = nodePath.node.source!.value;
  const resolvedSource = resolveModulePath(source, moduleBuilder.path);

  const specifiers: Array<{ local: string; exported: string }> = [];

  for (const specifier of nodePath.node.specifiers) {
    if (!t.isExportSpecifier(specifier)) {
      continue;
    }

    const local = specifier.local.name;
    const exported = t.isIdentifier(specifier.exported)
      ? specifier.exported.name
      : specifier.exported.value;

    specifiers.push({ local, exported });

    // Register as an import so ProjectBuilder discovers the source module
    // and CallGraph can resolve through the re-export chain.
    moduleBuilder.globals.set(exported, {
      kind: "import",
      name: local,
      source: resolvedSource,
    });
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ExportFromInstruction,
    place,
    nodePath,
    source,
    specifiers,
  );
  functionBuilder.addInstruction(instruction);

  // Register each re-exported name as an export for UnusedExportEliminationPass.
  for (const { exported } of specifiers) {
    moduleBuilder.exports.set(exported, {
      instruction,
      declaration: instruction,
    });
  }

  return place;
}
