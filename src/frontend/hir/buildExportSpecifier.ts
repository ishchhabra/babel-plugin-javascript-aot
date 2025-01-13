import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  ExportSpecifierInstruction,
  makeInstructionId,
  Place,
} from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
import { buildNode } from "./buildNode";

export function buildExportSpecifier(
  nodePath: NodePath<t.ExportSpecifier>,
  builder: HIRBuilder,
): Place {
  const localPath = nodePath.get("local");
  const localPlace = buildNode(localPath, builder);
  if (localPlace === undefined || Array.isArray(localPlace)) {
    throw new Error("Export specifier local must be a single place");
  }

  const exportedPath = nodePath.get("exported") ?? localPath;
  let exportedName: string | undefined;
  if (exportedPath.isIdentifier()) {
    exportedName = exportedPath.node.name;
  } else if (exportedPath.isStringLiteral()) {
    exportedName = exportedPath.node.value;
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );
  const instruction = new ExportSpecifierInstruction(
    instructionId,
    place,
    nodePath,
    localPlace,
    exportedName!,
  );

  builder.currentBlock.instructions.push(instruction);
  builder.exportToInstructions.set(exportedName!, instruction);
  return place;
}
