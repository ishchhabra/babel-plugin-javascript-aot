import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  ExportNamedDeclarationInstruction,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildExportNamedDeclaration(
  nodePath: NodePath<t.ExportNamedDeclaration>,
  builder: HIRBuilder,
) {
  const declarationPath = nodePath.get("declaration");
  const specifiersPath = nodePath.get("specifiers");

  // An export can have either declaration or specifiers, but not both.
  if (declarationPath.hasNode()) {
    let declarationPlace = buildNode(declarationPath, builder);
    if (Array.isArray(declarationPlace)) {
      // TODO: Iterate over all declaration places to split them into multiple instructions.
      // Example:
      //   export const a = 1, b = 2;
      //   =>
      //   export const a = 1;
      //   export const b = 2;
      declarationPlace = declarationPlace[0];
    }

    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instruction = new ExportNamedDeclarationInstruction(
      makeInstructionId(builder.environment.nextInstructionId++),
      place,
      nodePath,
      [],
      declarationPlace!,
    );
    builder.currentBlock.instructions.push(instruction);
    builder.exportToInstructions.set(identifier.name, instruction);
    return place;
  } else {
    const exportSpecifierPlaces = specifiersPath.map((specifierPath) => {
      const exportSpecifierPlace = buildNode(specifierPath, builder);
      if (
        exportSpecifierPlace === undefined ||
        Array.isArray(exportSpecifierPlace)
      ) {
        throw new Error(`Export specifier must be a single place`);
      }
      return exportSpecifierPlace;
    });

    const identifier = createIdentifier(builder.environment);
    const place = createPlace(identifier, builder.environment);
    const instruction = new ExportNamedDeclarationInstruction(
      makeInstructionId(builder.environment.nextInstructionId++),
      place,
      nodePath,
      exportSpecifierPlaces,
      undefined,
    );
    builder.currentBlock.instructions.push(instruction);
    builder.exportToInstructions.set(identifier.name, instruction);
    return place;
  }
}
