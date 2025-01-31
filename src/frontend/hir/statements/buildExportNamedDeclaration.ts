import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { ExportNamedDeclarationInstruction } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildExportNamedDeclaration(
  nodePath: NodePath<t.ExportNamedDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
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
