import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  ImportSpecifierInstruction,
  Place,
} from "../../ir";
import { buildNode } from "./buildNode";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export function buildImportSpecifier(
  nodePath: NodePath<t.ImportSpecifier>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const importedPath = nodePath.get("imported");
  const importedPlace = buildNode(importedPath, functionBuilder, moduleBuilder);

  const localPath = nodePath.get("local");
  const localPlace = localPath.hasNode()
    ? buildNode(localPath, functionBuilder, moduleBuilder)
    : undefined;

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  functionBuilder.currentBlock.instructions.push(
    new ImportSpecifierInstruction(
      createInstructionId(functionBuilder.environment),
      place,
      nodePath,
      importedPlace as Place,
      localPlace as Place,
    ),
  );

  return place;
}
