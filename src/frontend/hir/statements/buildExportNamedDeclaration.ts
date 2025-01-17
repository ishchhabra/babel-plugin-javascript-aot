import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  ExportNamedDeclarationInstruction,
  makeInstructionId,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildExportNamedDeclaration(
  nodePath: NodePath<t.ExportNamedDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const declarationPath = nodePath.get("declaration");
  const specifiersPath = nodePath.get("specifiers");

  // An export can have either declaration or specifiers, but not both.
  if (declarationPath.hasNode()) {
    let declarationPlace = buildNode(
      declarationPath,
      functionBuilder,
      moduleBuilder,
    );
    if (Array.isArray(declarationPlace)) {
      // TODO: Iterate over all declaration places to split them into multiple instructions.
      // Example:
      //   export const a = 1, b = 2;
      //   =>
      //   export const a = 1;
      //   export const b = 2;
      declarationPlace = declarationPlace[0];
    }

    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instruction = new ExportNamedDeclarationInstruction(
      makeInstructionId(functionBuilder.environment.nextInstructionId++),
      place,
      nodePath,
      [],
      declarationPlace!,
    );
    functionBuilder.currentBlock.instructions.push(instruction);
    moduleBuilder.exportToInstructions.set(identifier.name, instruction);
    return place;
  } else {
    const exportSpecifierPlaces = specifiersPath.map((specifierPath) => {
      const exportSpecifierPlace = buildNode(
        specifierPath,
        functionBuilder,
        moduleBuilder,
      );
      if (
        exportSpecifierPlace === undefined ||
        Array.isArray(exportSpecifierPlace)
      ) {
        throw new Error(`Export specifier must be a single place`);
      }
      return exportSpecifierPlace;
    });

    const identifier = createIdentifier(functionBuilder.environment);
    const place = createPlace(identifier, functionBuilder.environment);
    const instruction = new ExportNamedDeclarationInstruction(
      makeInstructionId(functionBuilder.environment.nextInstructionId++),
      place,
      nodePath,
      exportSpecifierPlaces,
      undefined,
    );
    functionBuilder.currentBlock.instructions.push(instruction);
    moduleBuilder.exportToInstructions.set(identifier.name, instruction);
    return place;
  }
}
