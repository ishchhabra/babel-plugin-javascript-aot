import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  ExportSpecifierInstruction,
  Place,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
import { buildNode } from "./buildNode";

export function buildExportSpecifier(
  nodePath: NodePath<t.ExportSpecifier>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place {
  const localPath = nodePath.get("local");
  const localPlace = buildNode(localPath, functionBuilder, moduleBuilder);
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

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = createInstructionId(functionBuilder.environment);
  const instruction = new ExportSpecifierInstruction(
    instructionId,
    place,
    nodePath,
    localPlace,
    exportedName!,
  );

  functionBuilder.addInstruction(instruction);
  moduleBuilder.exportToInstructions.set(exportedName!, instruction);
  return place;
}
