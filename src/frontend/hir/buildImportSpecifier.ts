import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  ImportSpecifierInstruction,
  makeInstructionId,
  Place,
} from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
import { buildNode } from "./buildNode";

export function buildImportSpecifier(
  nodePath: NodePath<t.ImportSpecifier>,
  builder: HIRBuilder,
) {
  const importedPath = nodePath.get("imported");
  const importedPlace = buildNode(importedPath, builder);

  const localPath = nodePath.get("local");
  const localPlace = localPath.hasNode()
    ? buildNode(localPath, builder)
    : undefined;

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  builder.currentBlock.instructions.push(
    new ImportSpecifierInstruction(
      makeInstructionId(builder.environment.nextInstructionId++),
      place,
      nodePath,
      importedPlace as Place,
      localPlace as Place,
    ),
  );

  return place;
}
